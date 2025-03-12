<!DOCTYPE html>
<html>

<?= $this->View('Head'); ?>

<?= $this->View('Body', [
    'body' => $body ?? null
]) ?>

</html>