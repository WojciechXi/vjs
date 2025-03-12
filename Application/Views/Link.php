<?php
$attr = [
    'rel' => 'stylesheet',
    'type' => 'text/css',
    'href' => isset($href) ? $href : null,
];
?>
<link <?= Attr($attr); ?>>