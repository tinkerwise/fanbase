<?php
/**
 * Password-protected page for reading feedback (feedback.php).
 *
 * Lists feedback-data/feedback.jsonl newest first, with the rating counts and
 * a rating filter. The password is never in the repo: `npm run
 * feedback-password` uploads a PBKDF2 hash of it to feedback-data/admin.json,
 * which shares the log's web-denied folder and survives deploys. Until that
 * file exists the page stays locked.
 *
 * A login lasts 30 days in a session cookie. Each IP gets 5 wrong passwords
 * per 15 minutes.
 */

header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'");

const PER_PAGE = 100;
const SESSION_DAYS = 30;
const MAX_FAILS = 5;
const FAIL_WINDOW = 15 * 60;

$dir = __DIR__ . '/feedback-data';
$log = "$dir/feedback.jsonl";
$auth = "$dir/admin.json";
if (is_dir($dir) && !file_exists("$dir/.htaccess")) file_put_contents("$dir/.htaccess", "Require all denied\nDeny from all\n");

function h($value) {
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function checkPassword($password, $authFile) {
    $saved = json_decode((string) @file_get_contents($authFile), true);
    if (!is_array($saved) || empty($saved['salt']) || empty($saved['hash']) || empty($saved['iterations'])) return false;
    $hash = base64_encode(hash_pbkdf2('sha256', $password, base64_decode($saved['salt']), (int) $saved['iterations'], 32, true));
    return hash_equals($saved['hash'], $hash);
}

session_name('fb_feedback');
session_set_cookie_params([
    'lifetime' => SESSION_DAYS * 86400,
    'path' => dirname($_SERVER['SCRIPT_NAME'] ?? '/') ?: '/',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Strict',
]);
ini_set('session.gc_maxlifetime', (string) (SESSION_DAYS * 86400));
session_start();
$self = strtok($_SERVER['REQUEST_URI'] ?? 'feedback-admin.php', '?');

if (isset($_POST['logout'])) {
    $_SESSION = [];
    session_destroy();
    header("Location: $self", true, 303);
    exit;
}

$error = '';
if (isset($_POST['password'])) {
    // Wrong passwords are counted per IP in the system temp directory, like feedback.php's rate limit
    $ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . __FILE__);
    $failFile = rtrim(sys_get_temp_dir(), '/') . '/fanbase-feedback-admin-' . substr($ipHash, 0, 16);
    $fails = array_filter(array_map('intval', explode(',', (string) @file_get_contents($failFile))), fn($t) => $t > time() - FAIL_WINDOW);
    if (count($fails) >= MAX_FAILS) {
        $error = 'Too many tries. Wait 15 minutes and try again.';
    } elseif (!file_exists($auth)) {
        $error = 'No password is set yet. Run npm run feedback-password first.';
    } elseif (checkPassword((string) $_POST['password'], $auth)) {
        @unlink($failFile);
        session_regenerate_id(true);
        $_SESSION['ok'] = true;
        header("Location: $self", true, 303);
        exit;
    } else {
        $fails[] = time();
        @file_put_contents($failFile, implode(',', $fails));
        $error = 'That password isn’t right.';
    }
}

$loggedIn = !empty($_SESSION['ok']);
$rows = [];
$rating = null;
$page = 1;
$pages = 1;
if ($loggedIn) {
    $lines = file_exists($log) ? file($log, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];
    foreach (array_reverse($lines) as $line) {
        $row = json_decode($line, true);
        if (is_array($row) && in_array($row['rating'] ?? null, [-1, 0, 1], true)) $rows[] = $row;
    }
    $counts = [1 => 0, 0 => 0, -1 => 0];
    foreach ($rows as $row) $counts[$row['rating']]++;
    $withComments = count(array_filter($rows, fn($r) => ($r['comment'] ?? '') !== ''));

    if (isset($_GET['rating']) && in_array($_GET['rating'], ['-1', '0', '1'], true)) $rating = (int) $_GET['rating'];
    $shown = $rating === null ? $rows : array_values(array_filter($rows, fn($r) => $r['rating'] === $rating));
    if (!empty($_GET['comments'])) $shown = array_values(array_filter($shown, fn($r) => ($r['comment'] ?? '') !== ''));
    $pages = max(1, (int) ceil(count($shown) / PER_PAGE));
    $page = min($pages, max(1, (int) ($_GET['page'] ?? 1)));
    $pageRows = array_slice($shown, ($page - 1) * PER_PAGE, PER_PAGE);
}

$EMOJI = [1 => '👍', 0 => '😐', -1 => '👎'];

function link_to($params) {
    $query = array_filter(array_merge(['rating' => $_GET['rating'] ?? null, 'comments' => $_GET['comments'] ?? null, 'page' => null], $params), fn($v) => $v !== null && $v !== '');
    return h(strtok($_SERVER['REQUEST_URI'] ?? '', '?') . ($query ? '?' . http_build_query($query) : ''));
}

function when($iso) {
    $time = strtotime((string) $iso);
    return $time ? gmdate('M j, Y · H:i', $time) . ' UTC' : '';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Fanbase Feedback</title>
<style>
  :root { --bg: #f6f6f4; --card: #fff; --text: #1b1b1b; --muted: #666; --line: #e3e3df; --accent: #1f5fbf; --bad: #b3261e; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #121314; --card: #1c1d1f; --text: #ececec; --muted: #a0a0a0; --line: #2e3033; --accent: #7fb0ff; --bad: #ff8a80; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 860px; margin: 0 auto; padding: 24px 16px 48px; }
  h1 { font-size: 22px; margin: 0; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
  a { color: var(--accent); }
  button, input { font: inherit; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 16px; }
  .login { max-width: 340px; margin: 12vh auto 0; display: grid; gap: 12px; }
  .login input { padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--bg); color: var(--text); }
  .btn { padding: 9px 14px; border: 0; border-radius: 8px; background: var(--accent); color: var(--card); cursor: pointer; font-weight: 600; }
  .btn-quiet { background: none; color: var(--muted); border: 1px solid var(--line); }
  .error { color: var(--bad); margin: 0; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 16px; }
  .stat b { display: block; font-size: 24px; }
  .stat span { color: var(--muted); font-size: 13px; }
  .filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .pill { padding: 5px 12px; border: 1px solid var(--line); border-radius: 999px; text-decoration: none; color: var(--text); background: var(--card); }
  .pill.on { border-color: var(--accent); color: var(--accent); font-weight: 600; }
  .entries { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
  .entry { display: grid; grid-template-columns: 32px 1fr; gap: 10px; }
  .entry .emoji { font-size: 22px; line-height: 1.2; }
  .entry p { margin: 0 0 4px; white-space: pre-wrap; overflow-wrap: anywhere; }
  .entry .none { color: var(--muted); font-style: italic; }
  .meta { color: var(--muted); font-size: 13px; overflow-wrap: anywhere; }
  .pager { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; color: var(--muted); }
  .empty { color: var(--muted); text-align: center; padding: 32px 16px; }
</style>
</head>
<body>
<main>
<?php if (!$loggedIn): ?>
  <form class="card login" method="post" action="<?= h($self) ?>">
    <h1>Fanbase feedback</h1>
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
    <?php if ($error): ?><p class="error" role="alert"><?= h($error) ?></p><?php endif; ?>
    <button class="btn" type="submit">Log in</button>
  </form>
<?php else: ?>
  <header>
    <h1>Fanbase feedback</h1>
    <form method="post" action="<?= h($self) ?>"><button class="btn btn-quiet" name="logout" value="1">Log out</button></form>
  </header>

  <section class="stats">
    <div class="card stat"><b><?= count($rows) ?></b><span>Entries</span></div>
    <div class="card stat"><b>👍 <?= $counts[1] ?></b><span>Love it</span></div>
    <div class="card stat"><b>😐 <?= $counts[0] ?></b><span>It’s okay</span></div>
    <div class="card stat"><b>👎 <?= $counts[-1] ?></b><span>Not great</span></div>
    <div class="card stat"><b><?= $withComments ?></b><span>With comments</span></div>
  </section>

  <nav class="filters" aria-label="Filter">
    <a class="pill<?= $rating === null ? ' on' : '' ?>" href="<?= link_to(['rating' => null]) ?>">All</a>
    <?php foreach ($EMOJI as $value => $emoji): ?>
      <a class="pill<?= $rating === $value ? ' on' : '' ?>" href="<?= link_to(['rating' => (string) $value]) ?>"><?= $emoji ?></a>
    <?php endforeach; ?>
    <a class="pill<?= !empty($_GET['comments']) ? ' on' : '' ?>" href="<?= link_to(['comments' => empty($_GET['comments']) ? '1' : null]) ?>">With comments</a>
  </nav>

  <?php if (!$pageRows): ?>
    <p class="card empty"><?= $rows ? 'Nothing matches this filter.' : 'No feedback yet.' ?></p>
  <?php else: ?>
    <ul class="entries">
      <?php foreach ($pageRows as $row): ?>
        <li class="card entry">
          <span class="emoji" aria-label="<?= h(['-1' => 'Not great', '0' => 'It’s okay', '1' => 'Love it'][(string) $row['rating']]) ?>"><?= $EMOJI[$row['rating']] ?></span>
          <div>
            <?php if (($row['comment'] ?? '') !== ''): ?><p><?= h($row['comment']) ?></p><?php else: ?><p class="none">No comment</p><?php endif; ?>
            <div class="meta">
              <?= h(when($row['at'] ?? '')) ?>
              <?php if (!empty($row['team'])): ?> · team <?= h($row['team']) ?><?php endif; ?>
              <?php if (!empty($row['page'])): ?> · <?= h($row['page']) ?><?php endif; ?>
              <?php if (!empty($row['ua'])): ?><br><?= h($row['ua']) ?><?php endif; ?>
            </div>
          </div>
        </li>
      <?php endforeach; ?>
    </ul>
    <?php if ($pages > 1): ?>
      <div class="pager">
        <?php if ($page > 1): ?><a href="<?= link_to(['page' => (string) ($page - 1)]) ?>">← Newer</a><?php else: ?><span></span><?php endif; ?>
        <span>Page <?= $page ?> of <?= $pages ?></span>
        <?php if ($page < $pages): ?><a href="<?= link_to(['page' => (string) ($page + 1)]) ?>">Older →</a><?php else: ?><span></span><?php endif; ?>
      </div>
    <?php endif; ?>
  <?php endif; ?>
<?php endif; ?>
</main>
</body>
</html>
