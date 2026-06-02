<?php

declare(strict_types=1);

$localConfigPath = __DIR__ . '/config.local.php';
$localConfig = [];

if (is_file($localConfigPath)) {
    $loadedConfig = require $localConfigPath;
    if (is_array($loadedConfig)) {
        $localConfig = $loadedConfig;
    }
}

$configValue = static function (string $key, string $fallback = '') use ($localConfig): string {
    $envValue = getenv($key);

    if (is_string($envValue) && $envValue !== '') {
        return $envValue;
    }

    $localValue = $localConfig[$key] ?? $localConfig[strtolower($key)] ?? $fallback;

    return is_string($localValue) ? trim($localValue) : $fallback;
};

$allowedOrigins = array_filter(array_map('trim', explode(',', $configValue('ALLOWED_ORIGIN', '*'))));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array('*', $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: *');
} elseif ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
} elseif (!empty($allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigins[0]);
    header('Vary: Origin');
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$botToken = $configValue('BOT_TOKEN');
$chatId = $configValue('CHAT_ID');

if ($botToken === '' || $chatId === '') {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Server is not configured'], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawPayload = file_get_contents('php://input') ?: '';
$payload = json_decode($rawPayload, true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON payload'], JSON_UNESCAPED_UNICODE);
    exit;
}

$requiredFields = ['name', 'contact', 'task', 'message'];
$missingFields = [];

foreach ($requiredFields as $field) {
    if (trim((string)($payload[$field] ?? '')) === '') {
        $missingFields[] = $field;
    }
}

if ($missingFields !== []) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing fields: ' . implode(', ', $missingFields)], JSON_UNESCAPED_UNICODE);
    exit;
}

$clean = static fn ($value): string => htmlspecialchars(trim((string)$value), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

$text = implode("\n", [
    '<b>Новая заявка с портфолио</b>',
    'Имя: ' . $clean($payload['name'] ?? ''),
    'Контакт: ' . $clean($payload['contact'] ?? ''),
    'Задача: ' . $clean($payload['taskLabel'] ?? $payload['task'] ?? ''),
    'Язык: ' . $clean($payload['language'] ?? ''),
    'Источник: ' . $clean($payload['source'] ?? ''),
    'Страница: ' . $clean($payload['page'] ?? ''),
    'Время: ' . $clean($payload['createdAt'] ?? ''),
    '',
    '<b>Описание</b>',
    $clean($payload['message'] ?? ''),
]);

$telegramPayload = json_encode([
    'chat_id' => $chatId,
    'text' => $text,
    'parse_mode' => 'HTML',
    'disable_web_page_preview' => true,
], JSON_UNESCAPED_UNICODE);

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $telegramPayload,
        'ignore_errors' => true,
        'timeout' => 10,
    ],
]);

$response = file_get_contents("https://api.telegram.org/bot{$botToken}/sendMessage", false, $context);
$statusLine = $http_response_header[0] ?? '';

if (strpos($statusLine, '200') === false) {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'Telegram API request failed'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
