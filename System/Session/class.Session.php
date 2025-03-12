<?php
class Session {

    //Global

    public static function Get(string $sessionKey, ?string $defaultValue = null): ?string {
        return isset($_SESSION[$sessionKey]) ? $_SESSION[$sessionKey] : $defaultValue;
    }

    public static function Set(string $sessionKey, string $sessionValue = null): bool {
        $_SESSION[$sessionKey] = $sessionValue;
        return $_SESSION[$sessionKey] == $sessionValue;
    }

    public static function Id(): string {
        return session_id();
    }

    public static function Start() {
        if (!array_key_exists('HTTP_USER_AGENT', $_SERVER)) $_SERVER['HTTP_USER_AGENT'] = '';

        if (strpos($_SERVER['HTTP_USER_AGENT'], "Googlebot") !== false) {
            session_id(md5("Google"));
        } else if (strpos($_SERVER['HTTP_USER_AGENT'], "bingbot") !== false) {
            session_id(md5("Bing"));
        } else if (strpos($_SERVER['HTTP_USER_AGENT'], 'Yandex') !== false) {
            session_id(md5("Yandex"));
        } else if (strpos($_SERVER['HTTP_USER_AGENT'], 'DotBot') !== false) {
            session_id(md5("DotBot"));
        } else if (strpos($_SERVER['HTTP_USER_AGENT'], "bot") !== false || strpos($_SERVER['HTTP_USER_AGENT'], "Bot") !== false) {
            session_id(md5("Bot"));

            $path = __DIR__ . '/Agents.json';
            if (!file_exists($path)) file_put_contents($path, '[]');
            $agents = Json::Decode(file_get_contents($path));
            if (!in_array($_SERVER['HTTP_USER_AGENT'], $agents)) {
                $agents[] = $_SERVER['HTTP_USER_AGENT'];
                file_put_contents($path, Json::Encode($agents));
            }
        } else if (strpos($_SERVER['HTTP_USER_AGENT'], "Wget") !== false) {
            session_id(md5("Wget"));
        }

        $timeout = 3600 * 24 * 7;
        ini_set("session.gc_maxlifetime", $timeout);
        ini_set("session.cookie_lifetime", $timeout);

        session_start();
    }

    public static function Destroy() {
        session_destroy();
    }

    //Local
}
