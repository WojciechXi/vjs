<?php
class System {

    private static array $paths = [];

    public static function GetPath(string $name): string {
        return isset(static::$paths[$name]) ? static::$paths[$name] : '';
    }

    public static function SetPath(string $name, string $path): string {
        return static::$paths[$name] = $path;
    }
}
