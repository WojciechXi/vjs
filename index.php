<?php
if (isset($_POST['REQUEST_METHOD'])) {
    $_SERVER['REQUEST_METHOD'] = $_POST['REQUEST_METHOD'];
    unset($_POST['REQUEST_METHOD']);
}

// if (!str_starts_with($_SERVER['HTTP_HOST'], 'www.')) {
//     header("Location: https://www.{$_SERVER['HTTP_HOST']}");
//     return;
// }

require_once __DIR__ . '/data.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

require_once __DIR__ . '/System/index.php';
require_once __DIR__ . '/Application/index.php';
