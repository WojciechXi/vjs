<tr>
    <td style="padding: 0.5rem;">
        <?php if ($file = $orderProduct->GetFile()): ?>
            <img src="<?= $file->GetUrl(); ?>" style="width: 5rem">
        <?php endif; ?>
    </td>
    <td style="padding: 0.5rem;">
        <p style="font-weight: bold;"><?= $orderProduct->name; ?></p>
        <div><?= $orderProduct->description; ?></div>
    </td>
    <td style="text-align: center; padding: 0.5rem;">
        <p style="white-space: nowrap;">
            <?php if ($orderProduct->type == 'Subscription'): ?>
                Abonament
            <?php elseif ($orderProduct->type == 'Option'): ?>
                Opcja
            <?php elseif ($orderProduct->type == 'Service'): ?>
                Usługa
            <?php else: ?>

            <?php endif; ?>
        </p>
    </td>
    <td style="text-align: center; padding: 0.5rem;">
        <p style="white-space: nowrap;"><?= $orderProduct->quantity; ?></p>
    </td>
    <td style="text-align: center; padding: 0.5rem;">
        <p style="white-space: nowrap;">
            <?php if ($orderProduct->unit == 'Piece'): ?>
                szt
            <?php elseif ($orderProduct->unit == 'RunningMeter'): ?>
                mb
            <?php else: ?>

            <?php endif; ?>
        </p>
    </td>
    <td style="text-align: center; padding: 0.5rem;">
        <p style="white-space: nowrap;"><?= number_format($orderProduct->priceNet, 2, ',', ' '); ?>zł</p>
    </td>
    <td style="text-align: center; padding: 0.5rem;">
        <p style="white-space: nowrap;"><?= number_format($orderProduct->priceNet * $orderProduct->quantity, 2, ',', ' '); ?>zł</p>
    </td>
    <td style="text-align: center; padding: 0.5rem;">
        <p style="white-space: nowrap;"><?= $orderProduct->discount; ?>%</p>
    </td>
    <td style="text-align: center; padding: 0.5rem;">
        <p style="white-space: nowrap;"><?= number_format(($orderProduct->priceNet * $orderProduct->quantity) * (1 - ($orderProduct->discount / 100)), 2, ',', ' '); ?>zł</p>
    </td>
</tr>