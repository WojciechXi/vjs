<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <?php $this->EachItem('Styles', function (string $name, string $url) {
        $this->View('Link', ['href' => $url], false);
    }); ?>

    <?php $this->EachItem('Scripts', function (string $name, string $url) {
        $this->View('Script', ['src' => $url], false);
    }); ?>
</head>