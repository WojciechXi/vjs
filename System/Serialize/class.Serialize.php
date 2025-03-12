<?php
class Serialize {

    public static function Encode(mixed $data): string {
        return serialize($data);
    }

    public static function Decode(string $string): mixed {
        return unserialize($string);
    }
}
