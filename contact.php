<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => '許可されていないリクエストです。'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$fields = [
    'company' => FILTER_SANITIZE_FULL_SPECIAL_CHARS,
    'name' => FILTER_SANITIZE_FULL_SPECIAL_CHARS,
    'email' => FILTER_SANITIZE_EMAIL,
    'phone' => FILTER_SANITIZE_FULL_SPECIAL_CHARS,
    'message' => FILTER_SANITIZE_FULL_SPECIAL_CHARS,
    'consent' => FILTER_SANITIZE_NUMBER_INT,
];

$input = filter_input_array(INPUT_POST, $fields, false) ?: [];

$requiredFields = ['company', 'name', 'email', 'message', 'consent'];
foreach ($requiredFields as $field) {
    if (empty($input[$field])) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => '未入力の項目があります。すべての必須項目をご入力ください。'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'メールアドレスの形式をご確認ください。'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$inquiry = [
    'company' => $input['company'],
    'name' => $input['name'],
    'email' => $input['email'],
    'phone' => $input['phone'] ?? '',
    'message' => $input['message'],
    'timestamp' => (new DateTime('now', new DateTimeZone('Asia/Tokyo')))->format(DateTimeInterface::ATOM),
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
];

$storageDir = __DIR__ . '/storage';
if (!is_dir($storageDir) && !mkdir($storageDir, 0775, true) && !is_dir($storageDir)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => '内部エラーが発生しました。後ほどお試しください。'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$logFile = $storageDir . '/inquiries.log';
$logEntry = json_encode($inquiry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;

if (file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'お問い合わせの記録に失敗しました。'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'お問い合わせを受け付けました。ありがとうございます。'
], JSON_UNESCAPED_UNICODE);
