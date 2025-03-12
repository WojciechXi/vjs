<?php if ($orderProducts = $orderSection->GetOrderProducts()) : ?>
    <thead>
        <tr>
            <th style="padding: 0.5rem;" colspan="2">
                <?= $orderSection->name; ?>
            </th>
            <th style="padding: 0.5rem; width: 0px;">
                Typ
            </th>
            <th style="padding: 0.5rem; width: 0px;">
                Ilość
            </th>
            <th style="padding: 0.5rem; width: 0px;">
                Jm
            </th>
            <th style="padding: 0.5rem; width: 0px;">
                Cena netto
            </th>
            <th style="padding: 0.5rem; width: 0px;">
                Wartość netto
            </th>
            <th style="padding: 0.5rem; width: 0px;">
                Rabat
            </th>
            <th style="padding: 0.5rem; width: 0px;">
                Wartość po rabacie
            </th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($orderProducts as $orderProduct): ?>
            <?= $this->View('Print/OrderProduct', [
                'orderProduct' => $orderProduct,
            ]); ?>
        <?php endforeach; ?>
    </tbody>
    <tfoot>
        <tr>
            <td style="padding: 0.5rem; text-align: right;" colspan="9">
                Wartość: <b><?= number_format($orderSection->priceNet, 2, ',', ' '); ?>zł</b>
            </td>
        </tr>
    </tfoot>
<?php endif; ?>