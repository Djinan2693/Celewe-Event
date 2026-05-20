<?php
$zip = new ZipArchive;
$zipPath = __DIR__ . '/deploy.zip';
$dest = __DIR__ . '/';
if ($zip->open($zipPath) === TRUE) {
    $zip->extractTo($dest);
    $zip->close();
    unlink($zipPath);
    unlink(__FILE__);
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'ZipArchive failed']);
}
