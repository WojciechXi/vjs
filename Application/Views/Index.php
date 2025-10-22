<!DOCTYPE html>
<html lang="pl">

<?= $this->View('Head'); ?>

<?= $this->View('Body', [
    'body' => $body ?? null
]) ?>

</html>