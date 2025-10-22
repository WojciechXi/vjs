<?php
class Cookie {

    //Global

    public static function Get(string $cookieKey, ?string $defaultValue = null): ?string {
        $cookieKey = str_replace(['.', '_', ' '], '-', $cookieKey);
        return isset($_COOKIE[$cookieKey]) ? $_COOKIE[$cookieKey] : $defaultValue;
    }

    public static function Set(string $cookieKey, string $cookieValue): bool {
        $cookieKey = str_replace(['.', '_', ' '], '-', $cookieKey);
        return setcookie($cookieKey, $cookieValue, 0, '/');
    }
}
