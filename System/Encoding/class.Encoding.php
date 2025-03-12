<?php
class Encoding {

    public static function Base64Encode(string $string): string {
        return base64_encode($string);
    }

    public static function Base64Decode(string $string): string {
        return base64_decode($string);
    }

    public static function UrlEncode(string $string): string {
        return urlencode($string);
    }

    public static function UrlDecode(string $string): string {
        return urldecode($string);
    }
}
