<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $order->name; ?></title>
    <style>
        * {
            box-sizing: border-box;

            font-size: inherit;
            font-family: inherit;

            margin: initial;
            padding: initial;
        }

        html {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            font-size: 10pt;
        }

        body {
            display: flex;
            justify-content: center;
        }

        main {
            padding: 1rem;
            width: 210mm;
        }

        table thead tr {
            vertical-align: middle;
        }

        table tbody tr {
            vertical-align: top;
        }

        table thead tr th {
            font-size: 0.8rem;
        }

        h6 {
            font-size: 1.1rem;
        }

        h5 {
            font-size: 1.2rem;
        }

        h4 {
            font-size: 1.3rem;
        }

        h3 {
            font-size: 1.4rem;
        }

        h2 {
            font-size: 1.5rem;
        }

        h1 {
            font-size: 2.0rem;
        }
    </style>
</head>

<body>
    <main>
        <?= $this->View('Print/Order', [
            'order' => $order,
        ]); ?>
    </main>
</body>

</html>