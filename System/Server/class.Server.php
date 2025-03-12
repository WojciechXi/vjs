<?php
class Server {

    //Global

    public static function Get(string $serverKey, ?string $defaultValue = null): ?string {
        return isset($_SERVER[$serverKey]) ? $_SERVER[$serverKey] : $defaultValue;
    }

    public static function Set(string $serverKey, string $serverValue = null): bool {
        $_SERVER[$serverKey] = $serverValue;
        return $_SERVER[$serverKey] == $serverValue;
    }

    public static function Is(string $serverKey, string $value = null): bool {
        return Server::Get($serverKey) == $value;
    }
}
