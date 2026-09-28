<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Auto-detect vanity_backend location dynamically across all Hostinger folder structures
$possiblePaths = [
    __DIR__ . '/../../vanity_backend',
    __DIR__ . '/../vanity_backend',
    __DIR__ . '/../../../vanity_backend',
    dirname(dirname(__DIR__)) . '/vanity_backend',
    dirname(__DIR__) . '/vanity_backend',
];

$backendPath = null;
foreach ($possiblePaths as $path) {
    if (file_exists($path . '/vendor/autoload.php') && file_exists($path . '/bootstrap/app.php')) {
        $backendPath = realpath($path);
        break;
    }
}

if (!$backendPath) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Backend directory [vanity_backend] not found. Please ensure vanity_backend folder is uploaded in your Hostinger root directory.'
    ]);
    exit;
}

// Maintenance mode check
if (file_exists($backendPath . '/storage/framework/down')) {
    require $backendPath . '/storage/framework/down';
}

// Register the Composer autoloader
require $backendPath . '/vendor/autoload.php';

// Bootstrap Laravel and handle the request
$app = require_once $backendPath . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
);

$response->send();

$kernel->terminate($request, $response);
