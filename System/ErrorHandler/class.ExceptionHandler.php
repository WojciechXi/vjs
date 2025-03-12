<?php
class ExceptionHandler {

    public static ?ExceptionHandler $handler = null;

    public static function Handle($exception): bool {
        return static::$handler ? static::$handler->Exception($exception) : false;
    }

    public function Exception($exception): bool {
        $now = date('Y-m-d H:i:s');
        die($now);
        $errors = file_exists(RootPath . "/Exception.txt") ? file_get_contents(RootPath . "/Exception.txt") : "";
        $errors .= "\n[{$now}] {$exception}";
        file_get_contents(RootPath . "/Exception.txt", $errors);
        return true;
    }
}
