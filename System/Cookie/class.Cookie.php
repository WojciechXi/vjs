<?php
class Cookie {

    //Global

    public static function Get(string $cookieKey, ?string $defaultValue = null): ?string {
        return isset($_COOKIE[$cookieKey]) ? $_COOKIE[$cookieKey] : $defaultValue;
    }

    public static function Set(string $cookieKey, string $cookieValue = null): bool {
        return setcookie($cookieKey, $cookieValue, 0, '/');
    }
}
