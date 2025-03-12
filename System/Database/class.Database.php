<?php
class Database {

    private static ?mysqli $mysqli = null;
    private static string $database = '';

    public static function Connect(string $host, string $user, string $password, string $database, string $charset = 'utf8mb4') {
        static::$database = $database;
        try {
            static::$mysqli = new mysqli($host, $user, $password);
            static::$mysqli->set_charset($charset);
            static::$mysqli->select_db($database);
        } catch (Exception $exception) {
            print_r("<div style=\"white-space: pre-wrap;\">{$exception}</div>");
        } catch (Error $error) {
            print_r("<div style=\"white-space: pre-wrap;\">{$error}</div>");
        }
    }

    public static function Close(): bool {
        return static::$mysqli ? static::$mysqli->close() : true;
    }

    public static function InsertId(): int {
        return static::$mysqli->insert_id;
    }

    public static function RealEscape(string $string = null): ?string {
        return $string ? static::$mysqli->real_escape_string($string) : $string;
    }

    public static function Sql(array|string $sql, string $database = null): mysqli_result | bool {
        if (is_array($sql)) $sql = implode(' ', $sql);
        static::$mysqli->select_db($database ? $database : static::$database);
        return static::$mysqli->query($sql);
    }

    public static function Query(string $table, string $database = null): DatabaseQuery {
        return new DatabaseQuery($table, $database);
    }

    public static function And(array $operators) {
        if (!$operators) return '';
        $operators = implode(' AND ', $operators);
        return "( {$operators} )";
    }

    public static function Or(array $operators) {
        if (!$operators) return '';
        $operators = implode(' OR ', $operators);
        return "( {$operators} )";
    }

    public static function Equals(?string $left, ?string $right) {
        return "{$left} = '{$right}'";
    }

    public static function NotEquals(?string $left, ?string $right) {
        return "{$left} != '{$right}'";
    }

    public static function Like(?string $left, ?string $right, string $format = '%Q%') {
        $format = str_replace('Q', $right, $format);
        return "{$left} LIKE '{$format}'";
    }
}
