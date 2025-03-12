<?php
define('SystemPath', realpath(__DIR__));

require_once SystemPath . '/ErrorHandler/class.ExceptionHandler.php';
require_once SystemPath . '/ErrorHandler/class.ErrorHandler.php';

require_once SystemPath . '/Json/class.Json.php';
require_once SystemPath . '/Serialize/class.Serialize.php';

require_once SystemPath . '/Graphics/class.Image.php';
require_once SystemPath . '/Graphics/class.Graphics.php';

require_once SystemPath . '/Encoding/class.Encoding.php';
require_once SystemPath . '/Cron/class.Cron.php';
require_once SystemPath . '/Hook/class.Hook.php';

require_once SystemPath . '/Server/class.Server.php';
require_once SystemPath . '/Session/class.Session.php';
require_once SystemPath . '/Cookie/class.Cookie.php';

require_once SystemPath . '/Curl/class.Curl.php';
require_once SystemPath . '/Load/class.Load.php';
require_once SystemPath . '/Cache/class.Cache.php';
require_once SystemPath . '/Storage/class.Storage.php';

require_once SystemPath . '/Application/class.Application.php';
require_once SystemPath . '/Module/class.Module.php';
require_once SystemPath . '/Plugin/class.Plugin.php';

require_once SystemPath . '/Request/class.RequestUri.php';
require_once SystemPath . '/Request/class.Request.php';

require_once SystemPath . '/Response/class.Response.php';

require_once SystemPath . '/Controller/class.Controller.php';
require_once SystemPath . '/Route/class.Route.php';

require_once SystemPath . '/Database/class.Database.php';
require_once SystemPath . '/Database/class.DatabaseQuery.php';
require_once SystemPath . '/Database/class.Model.php';
require_once SystemPath . '/Database/class.Table.php';
require_once SystemPath . '/Database/class.Migration.php';

require_once SystemPath . '/Config/class.Config.php';

require_once SystemPath . '/Addons/index.php';
