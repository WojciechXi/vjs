<?php
class ErrorHandler {

    public static ?ErrorHandler $handler = null;

    public static function Handle(): bool {
        $error = error_get_last();
        return $error ? (static::$handler ? static::$handler->Error($error) : false) : false;
    }

    public function Error($error): bool {
        $now = date('Y-m-d H:i:s');
        $error = join(" ", $error);
        $error = "[{$now}] {$error}";
        $errors = file_exists(RootPath . "/Error.txt") ? file_get_contents(RootPath . "/Error.txt") : "";
        $errors .= "\n{$error}";
        file_put_contents(RootPath . "/Error.txt", $errors);
        return true;
    }
}
