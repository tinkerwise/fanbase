<?php
/**
 * RSS proxy: fetches a feed (or page) from an allowlisted domain and returns
 * it as JSON for the site's scripts. Same-origin only (no CORS header).
 *
 *   ?url=<feed>               RSS 2.0 / Atom → { feedTitle, items: [...] }
 *   ?url=<page>&format=text   raw page text   → { text }
 *   ?url=<page>&format=og     og:image lookup → { image }
 *
 * http(s) only. Redirects are followed by hand, at most 3, and every hop
 * must stay on the allowlist. Responses are capped at 5 MB and cached in
 * the system temp directory (15 minutes, a day for og:image) so visitors
 * share one upstream fetch; if upstream fails, a stale copy is served.
 */

header('X-Content-Type-Options: nosniff');

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const CACHE_TTL = ['' => 900, 'text' => 900, 'og' => 86400];

function fail($code, $message) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['error' => $message]);
    exit;
}

// ── Allowlist of trusted RSS domains ─────────────────────────────
const ALLOWED_DOMAINS = [
    'mlb.com',
    'orioles.com',
    'espn.com',
    'baltimorebaseball.com',
    'blogs.fangraphs.com',
    'fangraphs.com',
    'tht.fangraphs.com',
    'mlbtraderumors.com',
    'baseballprospectus.com',
    'camdenchat.com',
    'birdswatcher.com',
    'eutawstreetreport.com',
    'masnsports.com',
    'orioleshangout.com',
    'cbssports.com',
    'sports.yahoo.com',
    'mlb.nbcsports.com',
    'nbcsports.com',
    'baseballamerica.com',
    'nytimes.com',
    'substack.com',
    'youtube.com',
    'megaphone.fm',
];

function is_allowed($url) {
    if (!filter_var($url, FILTER_VALIDATE_URL)) return false;
    $parts = parse_url($url);
    if (!in_array(strtolower($parts['scheme'] ?? ''), ['http', 'https'], true)) return false;
    if (isset($parts['user']) || isset($parts['pass'])) return false;
    $host = strtolower($parts['host'] ?? '');
    foreach (ALLOWED_DOMAINS as $domain) {
        if ($host === $domain || substr($host, -(strlen($domain) + 1)) === '.' . $domain) return true;
    }
    return false;
}

// A redirect's Location, made absolute against the URL that sent it
function resolve_url($base, $location) {
    if (preg_match('#^https?://#i', $location)) return $location;
    $b = parse_url($base);
    if (strpos($location, '//') === 0) return $b['scheme'] . ':' . $location;
    $origin = $b['scheme'] . '://' . $b['host'] . (isset($b['port']) ? ':' . $b['port'] : '');
    if (strpos($location, '/') === 0) return $origin . $location;
    return $origin . preg_replace('#/[^/]*$#', '/', $b['path'] ?? '/') . $location;
}

// Returns the body, or null on failure, a disallowed redirect or an oversize response
function fetch_upstream($url, $accept) {
    $headers = implode("\r\n", [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept: ' . $accept,
        'Accept-Language: en-US,en;q=0.9',
        'Sec-Fetch-Dest: document',
        'Sec-Fetch-Mode: navigate',
        'Sec-Fetch-Site: none',
    ]);
    for ($hop = 0; $hop <= MAX_REDIRECTS; $hop++) {
        $ctx = stream_context_create([
            'http' => [
                'timeout'         => 10,
                'follow_location' => 0,
                'ignore_errors'   => true,
                'header'          => $headers,
            ],
            'ssl' => ['verify_peer' => true, 'verify_peer_name' => true],
        ]);
        $body = @file_get_contents($url, false, $ctx, 0, MAX_BYTES + 1);
        $response_headers = function_exists('http_get_last_response_headers')
            ? (http_get_last_response_headers() ?? [])
            : ($http_response_header ?? []);
        $status = 0;
        $location = null;
        foreach ($response_headers as $line) {
            if (preg_match('#^HTTP/\S+\s+(\d{3})#', $line, $m)) { $status = (int) $m[1]; $location = null; }
            elseif (stripos($line, 'Location:') === 0) $location = trim(substr($line, 9));
        }
        if ($status >= 300 && $status < 400 && $location) {
            $url = resolve_url($url, $location);
            if (!is_allowed($url)) return null;
            continue;
        }
        if ($body === false || $status < 200 || $status >= 400 || strlen($body) > MAX_BYTES) return null;
        return $body;
    }
    return null;
}

function cache_file($format, $url) {
    return rtrim(sys_get_temp_dir(), '/') . '/fanbase-proxy/' . sha1($format . '|' . $url) . '.json';
}

function respond($json, $format, $url) {
    if ($json === false) fail(502, 'Could not encode response');
    $file = cache_file($format, $url);
    if (!is_dir(dirname($file))) @mkdir(dirname($file), 0700, true);
    if (@file_put_contents($file . '.tmp', $json) !== false) @rename($file . '.tmp', $file);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: public, max-age=' . CACHE_TTL[$format]);
    echo $json;
    exit;
}

// ── Validate request ──────────────────────────────────────────────
$url = (string) ($_GET['url'] ?? '');
$format = strtolower((string) ($_GET['format'] ?? ''));
if (!array_key_exists($format, CACHE_TTL)) fail(400, 'Unknown format');
if (!filter_var($url, FILTER_VALIDATE_URL)) fail(400, 'Missing or invalid url parameter');
if (!is_allowed($url)) fail(403, 'Domain not in allowlist');

// ── Cache ─────────────────────────────────────────────────────────
$cached = cache_file($format, $url);
$age = is_file($cached) ? time() - filemtime($cached) : PHP_INT_MAX;
if ($age < CACHE_TTL[$format]) {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: public, max-age=' . (CACHE_TTL[$format] - $age));
    readfile($cached);
    exit;
}

// ── Fetch the upstream resource ───────────────────────────────────
$xml_raw = fetch_upstream($url, $format === ''
    ? 'application/rss+xml, application/xml, text/xml, */*'
    : 'text/html, text/plain, */*');
if ($xml_raw === null) {
    if (is_file($cached)) {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: public, max-age=60');
        readfile($cached);
        exit;
    }
    fail(502, 'Failed to fetch feed');
}

if ($format === 'text') {
    respond(json_encode(['text' => $xml_raw], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE), $format, $url);
}

if ($format === 'og') {
    // Extract og:image (or twitter:image) from HTML head
    $image = null;
    $patterns = [
        '/<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']/',
        '/<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']/',
        '/<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']/',
        '/<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']twitter:image["\']/',
    ];
    foreach ($patterns as $pat) {
        if (preg_match($pat, $xml_raw, $m)) {
            $candidate = html_entity_decode(trim($m[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
            if (preg_match('#^https?://#i', $candidate) && filter_var($candidate, FILTER_VALIDATE_URL)) {
                $image = $candidate;
                break;
            }
        }
    }
    respond(json_encode(['image' => $image], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $format, $url);
}

// ── Parse XML ─────────────────────────────────────────────────────
libxml_use_internal_errors(true);
$xml = simplexml_load_string($xml_raw, 'SimpleXMLElement', LIBXML_NOCDATA | LIBXML_NONET);
if ($xml === false) fail(502, 'Invalid XML in feed');

// ── Extract items (RSS 2.0 and Atom) ─────────────────────────────
$ns_map = $xml->getNamespaces(true);
$is_atom = isset($ns_map['']) && strpos($xml->getNamespaces()[''] ?? '', 'atom') !== false;

// RSS 2.0: channel > item | Atom: feed > entry
$entries = $xml->channel->item ?? $xml->entry ?? [];
$feed_title = (string)($xml->channel->title ?? $xml->title ?? '');

$items = [];
foreach ($entries as $entry) {
    $entry_ns = $entry->getNamespaces(true);

    // ── Title ──
    $title = trim((string)($entry->title ?? ''));

    // ── Link ──
    $link = '';
    // YouTube Atom: extract yt:videoId for reliable link + thumbnail
    $yt_video_id = '';
    if (isset($entry_ns['yt'])) {
        $yt = $entry->children($entry_ns['yt']);
        $yt_video_id = (string)($yt->videoId ?? '');
        if ($yt_video_id) {
            $link = 'https://www.youtube.com/watch?v=' . $yt_video_id;
        }
    }
    if (!$link) {
        // Atom: iterate <link> elements, prefer rel="alternate"
        if (!empty($entry->link)) {
            foreach ($entry->link as $lnk) {
                $attrs = $lnk->attributes();
                $rel = (string)($attrs['rel'] ?? '');
                $href = (string)($attrs['href'] ?? '');
                if ($rel === 'alternate' && $href) { $link = $href; break; }
                if (!$link && $href) $link = $href;
            }
            if (!$link) $link = (string)$entry->link;
        }
    }
    if (!$link && !empty($entry->guid)) {
        $guid = (string)$entry->guid;
        if (filter_var($guid, FILTER_VALIDATE_URL)) $link = $guid;
    }

    // ── Date ──
    $pub_date = (string)($entry->pubDate ?? $entry->updated ?? $entry->published ?? '');

    // ── Description (plain text excerpt) ──
    $description = '';
    if (!empty($entry->description)) {
        $description = strip_tags((string)$entry->description);
    } elseif (!empty($entry->summary)) {
        $description = strip_tags((string)$entry->summary);
    }
    $description = trim(preg_replace('/\s+/', ' ', $description));
    if (strlen($description) > 300) {
        $description = substr($description, 0, 297) . '…';
    }

    // ── Full content (content:encoded or atom content) ──
    $content = '';
    if (isset($entry_ns['content'])) {
        $content_ns = $entry->children($entry_ns['content']);
        $content = (string)($content_ns->encoded ?? $content_ns->content ?? '');
    }
    if (!$content && !empty($entry->content)) {
        $content = (string)$entry->content;
    }

    // ── Thumbnail ──
    $thumbnail = null;

    // media:content or media:thumbnail (also check inside media:group for YouTube)
    if (isset($entry_ns['media'])) {
        $media = $entry->children($entry_ns['media']);
        if (!empty($media->group)) {
            $group = $media->group->children($entry_ns['media']);
            if (!$thumbnail && !empty($group->thumbnail)) {
                $attrs = $group->thumbnail->attributes();
                $thumbnail = (string)($attrs['url'] ?? '');
            }
            if (!$thumbnail && !empty($group->content)) {
                $attrs = $group->content->attributes();
                $thumbnail = (string)($attrs['url'] ?? '');
            }
        }
        if (!$thumbnail && !empty($media->content)) {
            $attrs = $media->content->attributes();
            $thumbnail = (string)($attrs['url'] ?? '');
        }
        if (!$thumbnail && !empty($media->thumbnail)) {
            $attrs = $media->thumbnail->attributes();
            $thumbnail = (string)($attrs['url'] ?? '');
        }
    }

    // YouTube fallback: build thumbnail from yt:videoId
    if (!$thumbnail && $yt_video_id) {
        $thumbnail = 'https://i.ytimg.com/vi/' . $yt_video_id . '/mqdefault.jpg';
    }

    // enclosure with image type
    if (!$thumbnail && !empty($entry->enclosure)) {
        $enc = $entry->enclosure->attributes();
        $enc_type = strtolower((string)($enc['type'] ?? ''));
        if (strpos($enc_type, 'image/') === 0) {
            $thumbnail = (string)($enc['url'] ?? '');
        }
    }

    $audio_url = null;
    $audio_type = null;
    if (!empty($entry->enclosure)) {
        $enc = $entry->enclosure->attributes();
        $enc_type = strtolower((string)($enc['type'] ?? ''));
        if (strpos($enc_type, 'audio/') === 0) {
            $audio_url = (string)($enc['url'] ?? '');
            $audio_type = $enc_type ?: null;
        }
    }

    // Extract first <img> from content
    if (!$thumbnail && $content) {
        if (preg_match('/<img[^>]+src=["\']([^"\']+)["\']/i', $content, $m)) {
            $thumbnail = $m[1];
        }
    }

    // Only web URLs reach the page (no javascript:, data:, …)
    $web = fn($u) => ($u && preg_match('#^https?://#i', $u)) ? $u : null;

    $items[] = [
        'title'       => $title,
        'link'        => $web($link) ?? '',
        'pubDate'     => $pub_date,
        'description' => $description,
        'content'     => $content,
        'thumbnail'   => $web($thumbnail),
        'audioUrl'    => $web($audio_url),
        'audioType'   => $audio_type,
    ];

    if (count($items) >= 20) break;
}

respond(json_encode([
    'feedTitle' => $feed_title,
    'items'     => $items,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE), $format, $url);
