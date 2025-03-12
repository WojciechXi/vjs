<?php $orderSections = $order->GetOrderSections(); ?>
<table>
    <thead>
        <tr>
            <th style="padding: 0.5rem;" colspan="9">
                <h1><?= $order->name; ?></h1>
            </th>
        </tr>
    </thead>
    <?php foreach ($orderSections as $orderSection): ?>
        <?= $this->View('Print/OrderSection', [
            'orderSection' => $orderSection,
        ]); ?>
    <?php endforeach; ?>
    <tfoot>
        <tr>
            <td style="padding: 0.5rem;"></td>
            <td style="padding: 0.5rem;" colspan="8">
                <p>Wartość zamówienia: <b><?= number_format($order->priceNet, 2, ',', ' '); ?>zł</b></p>
                <br>
                <div><?= $order->description; ?></div>
            </td>
        </tr>
    </tfoot>
</table>