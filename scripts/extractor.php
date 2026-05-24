<?php
$zip = new ZipArchive;
$zipFile = isset($_GET['zip']) ? basename((string) $_GET['zip']) : 'deploy.zip';
$zipPath = __DIR__ . '/' . $zipFile;
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
