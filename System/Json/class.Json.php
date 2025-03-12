<?php
class Json {

    public static function Encode(mixed $data, int $flags = JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE): string {
        return json_encode($data, $flags);
    }

    public static function Decode(string $json): mixed {
        return json_decode($json);
    }
}
