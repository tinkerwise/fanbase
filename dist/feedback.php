<?php
/**
 * Feedback from the feedback dialog (src/scripts/feedback.js).
 *
 * POST JSON { rating: -1|0|1, comment, team, page, website }. `website` is a
 * honeypot: bots fill it, people never see it. Each entry is appended as one
 * JSON line to feedback-data/feedback.jsonl next to this file. That folder
 * denies web access, and deploy.sh excludes it from the mirror so deploys
 * never delete it. Fetch it with `npm run feedback`.
 *
 * Each IP (stored only as a salted hash, for the rate limit) gets 10 entries
 * a day, and the log stops growing at 5 MB.
 */

header('Content-Type: application/json; charset=utf-8');

function done($code, $body) {
    http_response_code($code);
    echo json_encode($body);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') done(405, ['error' => 'POST only']);
// A JSON content type makes other sites' requests preflight (and fail: no
// CORS header), so a cross-site text/plain form post can't add entries
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) done(415, ['error' => 'JSON only']);

$input = json_decode(file_get_contents('php://input', false, null, 0, 8192), true);
if (!is_array($input)) done(400, ['error' => 'Invalid JSON']);
// Pretend the honeypot entry worked so bots move on
if (!empty($input['website'])) done(200, ['ok' => true]);

$rating = $input['rating'] ?? null;
if (!in_array($rating, [-1, 0, 1], true)) done(400, ['error' => 'rating must be -1, 0 or 1']);

function clean($value, $max) {
    $text = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string) $value));
    return mb_substr($text, 0, $max);
}

$dir = __DIR__ . '/feedback-data';
$log = "$dir/feedback.jsonl";
if (!is_dir($dir) && !mkdir($dir, 0750)) done(500, ['error' => 'Storage unavailable']);
if (!file_exists("$dir/.htaccess")) file_put_contents("$dir/.htaccess", "Require all denied\nDeny from all\n");
if (file_exists($log) && filesize($log) > 5 * 1024 * 1024) done(507, ['error' => 'Feedback log is full']);

// Rate limit: 10 a day per IP, counted in the system temp directory
$ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . __FILE__);
$limitFile = rtrim(sys_get_temp_dir(), '/') . '/fanbase-feedback-' . substr($ipHash, 0, 16) . '-' . date('Ymd');
$sent = (int) @file_get_contents($limitFile);
if ($sent >= 10) done(429, ['error' => 'Too many entries today']);
@file_put_contents($limitFile, (string) ($sent + 1));

$entry = [
    'at' => gmdate('c'),
    'rating' => $rating,
    'comment' => clean($input['comment'] ?? '', 1000),
    'team' => clean($input['team'] ?? '', 4),
    'page' => clean($input['page'] ?? '', 100),
    'ua' => clean($_SERVER['HTTP_USER_AGENT'] ?? '', 200),
];
$line = json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
if (file_put_contents($log, $line, FILE_APPEND | LOCK_EX) === false) done(500, ['error' => 'Could not save']);

done(200, ['ok' => true]);
