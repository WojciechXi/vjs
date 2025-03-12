<?php
define('Https', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' || $_SERVER['REQUEST_SCHEME'] == 'https');
define('Scheme', Https ? 'https' : 'http');

define('RootPath', realpath(__DIR__));
define('RootUrl', Scheme . '://' . $_SERVER['SERVER_NAME']);

define('AssetsPath', RootPath . '/Assets');
define('AssetsUrl', RootUrl . '/Assets');

define('PluginsPath', RootPath . '/Plugins');
define('PluginsUrl', RootUrl . '/Plugins');

define('UploadsPath', RootPath . '/Uploads');
define('UploadsUrl', RootUrl . '/Uploads');

define('ErrorsPath', RootPath . '/Errors');
define('ErrorsUrl', RootUrl . '/Errors');

set_time_limit(15);
ini_set('memory_limit', '1G');
ini_set('max_execution_time', 15);
ini_set('display_errors', true);
error_reporting(E_ALL);
