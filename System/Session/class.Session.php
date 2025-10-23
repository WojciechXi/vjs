<?php
class Session {

    //Global

    public static function GetBots() {
        return [
            'wget' => 'Wget',

            'snapchat' => 'Snapchat',
            'facebookexternalhit' => 'Facebook',
            'archive.org_bot' => 'archive.org',
            'python-requests' => 'Python',

            'twitterbot' => 'TwitterBot',
            'pinterestbot' => 'PinterestBot',
            'googlebot' => 'GoogleBot',
            'google-inspectiontool' => 'GoogleInspectionTool',
            'applebot' => 'AppleBot',
            'bingbot' => 'BingBot',
            'yandex' => 'YandexBot',
            'dotbot' => 'DotBot',
            'serpstatbot' => 'SerpStatBot',
            'mj12bot' => 'MJ12Bot',
            'msnbot' => 'MSNBot',
            'claudebot' => 'ClaudeBot',
            'superbot' => 'SuperBot',
            'wpbot' => 'WPBot',
            'robot' => 'Robot',

            'bot' => 'Bot',
        ];
    }

    public static function SetHandler(?SessionHandler $sessionHandler): bool {
        return session_set_save_handler($sessionHandler, true);
    }

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
        $bots = static::GetBots();

        $httpUserAgent = mb_strtolower($_SERVER['HTTP_USER_AGENT']);
        foreach ($bots as $key => $value) {
            if (strpos($httpUserAgent, $key) !== false) {
                session_id($value);
                break;
            }
        }

        session_start();
    }

    public static function Destroy() {
        session_destroy();
    }

    //Local
}
