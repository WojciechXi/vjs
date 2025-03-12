<?php
$attr = [
    'type' => 'text/javascript',
    'src' => isset($src) ? $src : null,
];
?>
<script <?= Attr($attr); ?>>
    <?= isset($script) ? $script : null; ?>
</script>