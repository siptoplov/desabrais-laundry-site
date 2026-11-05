<?php
/**
 * Приём заявок с сайта → Telegram-группа (версия для обычного хостинга с PHP 7.4+).
 * Настройки — в файле config.php рядом (шаблон: config.example.php). Токен в репозиторий не попадает.
 * Защита: только POST, проверка Origin, поле-ловушка, время заполнения, Turnstile (если включён),
 * белый список полей и длин, проверка фото по сигнатуре, лимит частоты по IP, дубли.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

function out(int $code, array $body): void { http_response_code($code); echo json_encode($body, JSON_UNESCAPED_UNICODE); exit; }

$cfgFile = __DIR__ . '/config.php';
$cfg = is_file($cfgFile) ? (require $cfgFile) : [];
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(405, ['error' => 'method']);
if (empty($cfg['bot_token']) || empty($cfg['chat_id'])) out(503, ['error' => 'not_configured']);

/* Origin: только с этого же сайта (или из списка allowed_hosts) */
$hostOf = static function (string $u): string { return strtolower((string)parse_url($u, PHP_URL_HOST)); };
$h = $hostOf($_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? ''));
$self = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
$allowed = array_merge([$self], array_map('strtolower', $cfg['allowed_hosts'] ?? []));
if ($h === '' || !in_array($h, $allowed, true)) out(403, ['error' => 'origin']);

if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 4500000) out(413, ['error' => 'too_large']);

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$tmp = sys_get_temp_dir() . '/osm_apply';
@mkdir($tmp, 0700, true);

/* лимит: 4 заявки за 10 минут с одного IP */
$rateFile = $tmp . '/r_' . md5($ip);
$now = time();
$hits = is_file($rateFile) ? array_filter(array_map('intval', explode(',', (string)file_get_contents($rateFile))), fn($t) => $now - $t < 600) : [];
if (count($hits) >= 4) out(429, ['error' => 'rate']);

/* ловушка и время заполнения */
if (trim((string)($_POST['_hp'] ?? '')) !== '') out(200, ['ok' => true]);
$started = (int)(($_POST['_t'] ?? 0) / 1000);
if (!$started || $now - $started < 3 || $now - $started > 86400) out(400, ['error' => 'timing']);

/* Turnstile (если задан секрет) */
if (!empty($cfg['turnstile_secret'])) {
    $tok = (string)($_POST['cf-turnstile-response'] ?? '');
    $ok = false;
    if ($tok !== '') {
        $c = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
        curl_setopt_array($c, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8,
            CURLOPT_POSTFIELDS => http_build_query(['secret' => $cfg['turnstile_secret'], 'response' => $tok, 'remoteip' => $ip])]);
        $d = json_decode((string)curl_exec($c), true);
        $ok = !empty($d['success']);
    }
    if (!$ok) out(400, ['error' => 'captcha']);
}

/* что принимаем: name => [подпись, макс. длина, обязательное] */
$SPECS = [
    'fighter' => ['🥊 Заявка бойца', '#боец', 'thread_fighter', true, [
        'name' => ['Имя и фамилия', 120, true], 'city' => ['Страна, город', 120, true], 'discipline' => ['Дисциплина', 40, true],
        'weight' => ['Вес, кг', 10, true], 'record' => ['Профессиональный рекорд', 40, true], 'amateur' => ['Любительские бои', 300, true],
        'titles' => ['Регалии', 1200, true], 'video' => ['Видео боёв', 400, true], 'phone' => ['Телефон', 40, true],
        'telegram' => ['Telegram / Instagram', 80, false], 'email' => ['E-mail', 120, false], 'coach' => ['Тренер / менеджер', 160, false]]],
    'partner' => ['🤝 Заявка партнёра', '#партнёр', 'thread_partner', false, [
        'name' => ['Компания или имя', 160, true], 'contact' => ['Контакты', 160, true], 'message' => ['Сообщение', 1500, false]]],
    'rubaha' => ['👕 Рубаха-парень', '#рубаха', 'thread_rubaha', false, [
        'name' => ['Имя и фамилия', 120, true], 'age' => ['Возраст', 3, true], 'weight' => ['Вес, кг', 10, true],
        'profession' => ['Профессия', 120, true], 'training' => ['Спорт', 80, true], 'phone' => ['Телефон', 40, true],
        'telegram' => ['Telegram / Instagram', 80, false], 'bio' => ['Биография', 1500, true]]],
    'contact' => ['✉️ Вопрос с сайта', '#вопрос', 'thread_other', false, [
        'name' => ['Имя', 120, true], 'contact' => ['Контакты', 160, true], 'subject' => ['Тема', 160, false], 'message' => ['Сообщение', 2000, true]]],
    'merch' => ['🛍 Предзаказ мерча', '#мерч', 'thread_other', false, [
        'name' => ['Имя', 120, true], 'phone' => ['Телефон', 40, true], 'email' => ['E-mail', 120, false], 'items' => ['Состав заказа', 1500, false]]],
];
$kind = (string)($_POST['kind'] ?? '');
if (!isset($SPECS[$kind])) out(400, ['error' => 'kind']);
[$title, $tag, $threadKey, $needPhoto, $fields] = $SPECS[$kind];
if (($_POST['consent'] ?? '') !== 'yes') out(400, ['error' => 'consent']);

$clean = static function (string $s, int $max): string {
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x{200B}-\x{200F}\x{202A}-\x{202E}]/u', '', $s) ?? '';
    return mb_substr(trim($s), 0, $max);
};
$v = [];
foreach ($fields as $k => [$label, $max, $req]) {
    $v[$k] = $clean((string)($_POST[$k] ?? ''), $max);
    if ($req && $v[$k] === '') out(400, ['error' => 'required', 'field' => $k]);
}
/* телефон: любой настоящий номер; белорусские — по формату; отсекаем 2222222222 и 1234567890 (логика как в src/lib/phone.ts) */
$phoneOk = static function (string $v): bool {
    $v = trim($v);
    if (!preg_match('/^\+?[\d\s()\-]{7,25}$/', $v)) return false;
    $d = preg_replace('/\D/', '', $v);
    if ($v[0] !== '+' && preg_match('/^80\d{9}$/', $d)) $d = '375' . substr($d, 2);
    $n = strlen($d);
    if ($n < 9 || $n > 15) return false;
    $nat = $d;
    if (strncmp($d, '375', 3) === 0) {
        if ($n !== 12) return false;
        $nat = substr($d, 3);
        if (!in_array(substr($nat, 0, 2), ['25', '29', '33', '44', '15', '16', '17', '21', '22', '23'], true)) return false;
    } elseif ($v[0] !== '+' && $n < 10) return false;
    if (count(array_unique(str_split($nat))) < 4) return false;
    if (preg_match('/(\d)\1{4,}/', $nat)) return false;
    $up = 1; $down = 1;
    for ($i = 1; $i < strlen($nat); $i++) {
        $a = (int)$nat[$i - 1]; $b = (int)$nat[$i];
        $up = $b === $a + 1 ? $up + 1 : 1;
        $down = $b === $a - 1 ? $down + 1 : 1;
        if ($up >= 6 || $down >= 6) return false;
    }
    return true;
};
$emailOk = static fn($s) => (bool)preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/', $s);
if (!empty($v['video']) && !preg_match('~^https?://[^\s]+\.[^\s]{2,}$~i', $v['video'])) out(400, ['error' => 'video']);
if (!empty($v['phone']) && !$phoneOk($v['phone'])) out(400, ['error' => 'phone']);
if (!empty($v['email']) && !$emailOk($v['email'])) out(400, ['error' => 'email']);
if (!empty($v['age'])) {
    $a = (float)$v['age'];
    if ($a < 16 || $a > 70) out(400, ['error' => 'age']);
    if ($kind === 'rubaha' && $a < 18) out(400, ['error' => 'age18']);
}
if ($kind === 'rubaha' && ($_POST['eligible'] ?? '') !== 'yes') out(400, ['error' => 'eligible']);
if (!empty($v['contact']) && !($phoneOk($v['contact']) || $emailOk($v['contact']) || preg_match('/^@?[\w.]{3,}$/u', $v['contact']) || strpos($v['contact'], 't.me/') !== false)) out(400, ['error' => 'contact']);
if (!empty($v['message']) && preg_match_all('~https?://~i', $v['message']) > 3) out(400, ['error' => 'spam']);

/* фото */
$photo = null;
if ($needPhoto) {
    $f = $_FILES['photo'] ?? null;
    if (!$f || ($f['error'] ?? 1) === UPLOAD_ERR_NO_FILE || empty($f['size'])) out(400, ['error' => 'photo_required']);
    if (($f['error'] ?? 0) !== UPLOAD_ERR_OK || $f['size'] > 3500000) out(413, ['error' => 'photo_large']);
    $head = (string)file_get_contents($f['tmp_name'], false, null, 0, 12);
    $mime = null;
    if (strncmp($head, "\xFF\xD8\xFF", 3) === 0) $mime = 'image/jpeg';
    elseif (strncmp($head, "\x89PNG", 4) === 0) $mime = 'image/png';
    elseif (strncmp($head, 'RIFF', 4) === 0 && substr($head, 8, 4) === 'WEBP') $mime = 'image/webp';
    if (!$mime) out(400, ['error' => 'photo_type']);
    $photo = ['path' => $f['tmp_name'], 'mime' => $mime, 'name' => $kind . '.' . explode('/', $mime)[1]];
}

/* дубли: одинаковая заявка не чаще раза в 30 минут */
$dupFile = $tmp . '/d_' . md5($kind . '|' . implode('|', $v));
if (is_file($dupFile) && $now - filemtime($dupFile) < 1800) out(200, ['ok' => true]);

/* текст сообщения */
$esc = static fn($s) => htmlspecialchars($s, ENT_NOQUOTES | ENT_SUBSTITUTE, 'UTF-8');
$lines = [];
foreach ($fields as $k => [$label]) if ($v[$k] !== '') $lines[] = '<b>' . $esc($label) . ':</b> ' . $esc($v[$k]);
if ($kind === 'rubaha') $lines[] = '<i>Подтвердил: 18+, не профессионал в единоборствах, не выступает</i>';
$page = $clean((string)($_POST['page'] ?? ''), 200);
$text = mb_substr($title . ' ' . $tag . "\n\n" . implode("\n", $lines) . ($page !== '' ? "\n\n<i>" . $esc($page) . '</i>' : ''), 0, 4000);
$thread = $cfg[$threadKey] ?? ($cfg['thread_other'] ?? null);

$tg = static function (string $method, array $payload) use ($cfg): bool {
    $c = curl_init('https://api.telegram.org/bot' . $cfg['bot_token'] . '/' . $method);
    curl_setopt_array($c, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 20, CURLOPT_POSTFIELDS => $payload]);
    curl_exec($c);
    return curl_getinfo($c, CURLINFO_HTTP_CODE) === 200;
};
$base = ['chat_id' => $cfg['chat_id']];
if ($thread) $base['message_thread_id'] = (int)$thread;

if (!$tg('sendMessage', $base + ['text' => $text, 'parse_mode' => 'HTML', 'disable_web_page_preview' => 'true'])) out(502, ['error' => 'telegram']);
if ($photo) $tg('sendPhoto', $base + ['caption' => 'Фото: ' . $v['name'], 'photo' => new CURLFile($photo['path'], $photo['mime'], $photo['name'])]);

@touch($dupFile);
$hits[] = $now;
@file_put_contents($rateFile, implode(',', $hits));
out(200, ['ok' => true]);
