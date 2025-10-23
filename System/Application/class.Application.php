<?php
class Application extends Load {

    private static ?Application $instance = null;
    public static function GetInstance(): ?Application {
        return static::$instance;
    }

    public function __construct() {
        static::$instance = $this;

        $this->SetUrl('Config', ApplicationUrl . '/Config');
        $this->SetUrl('Functions', ApplicationUrl . '/Functions');
        $this->SetUrl('Cache', ApplicationUrl . '/Cache');
        $this->SetUrl('Assets', ApplicationUrl . '/Assets');
        $this->SetUrl('Resources', ApplicationUrl . '/Resources');
        $this->SetUrl('Classes', ApplicationUrl . '/Classes');
        $this->SetUrl('Libraries', ApplicationUrl . '/Libraries');
        $this->SetUrl('Models', ApplicationUrl . '/Models');
        $this->SetUrl('Controllers', ApplicationUrl . '/Controllers');
        $this->SetUrl('Modules', ApplicationUrl . '/Modules');
        $this->SetUrl('Routes', ApplicationUrl . '/Routes');
        $this->SetUrl('Views', ApplicationUrl . '/Views');
        $this->SetUrl('Uploads', RootUrl . '/Uploads');

        $this->SetPath('Config', ApplicationPath . '/Config');
        $this->SetPath('Functions', ApplicationPath . '/Functions');
        $this->SetPath('Cache', ApplicationPath . '/Cache');
        $this->SetPath('Assets', ApplicationPath . '/Assets');
        $this->SetPath('Resources', ApplicationPath . '/Resources');
        $this->SetPath('Classes', ApplicationPath . '/Classes');
        $this->SetPath('Libraries', ApplicationPath . '/Libraries');
        $this->SetPath('Models', ApplicationPath . '/Models');
        $this->SetPath('Controllers', ApplicationPath . '/Controllers');
        $this->SetPath('Modules', ApplicationPath . '/Modules');
        $this->SetPath('Routes', ApplicationPath . '/Routes');
        $this->SetPath('Views', ApplicationPath . '/Views');
        $this->SetPath('Uploads', RootPath . '/Uploads');

        Session::Start();
    }

    public function __get(string $propertyName) {
        switch ($propertyName) {
            case 'Cache':
                return $this->cache;
            case 'Storage':
                return $this->storage;
            case 'Request':
                return $this->request;
            case 'Response':
                return $this->response;
            case 'Route':
                return $this->route;
        }
    }

    public function GetRequest(): ?Request {
        return $this->request;
    }

    public function Print(mixed $data): string {
        return $this->View('Print', ['data' => $data]);
    }

    public function Path(string $name, string $path): string {
        return $this->GetPath($name, $path);
    }

    public function Url(string $path, string $separator = '/'): string {
        $requestScheme = Server::Get('REQUEST_SCHEME');
        $httpHost = Server::Get('HTTP_HOST');
        return "{$requestScheme}://{$httpHost}{$separator}{$path}";
    }

    public function File(string $file, array $pass = [], bool $mergeData = true) {
        $pass['cache'] = $this->cache;
        $pass['request'] = $this->request;
        return parent::File($file, $pass, $mergeData);
    }

    public function Init(?callable $before = null, ?callable $after = null) {
        $this->config = new Config($this);

        if ($before && is_callable($before)) $before($this);

        $this->cache = new Cache($this);
        $this->request = new Request($this, $_GET, $_POST, $_FILES);
        $this->response = new Response($this);
        $this->route = new Route($this, $this->request, $this->response);

        if ($after && is_callable($after)) $after($this);
    }

    public function Connect(string $host, string $user, string $password, string $database, ?callable $before = null, ?callable $after = null) {
        if ($before && is_callable($before)) $before($this);

        Database::Connect($host, $user, $password, $database, 'utf8mb4');

        if ($after && is_callable($after)) $after($this);
    }

    public function Load(?callable $before = null, ?callable $after = null) {
        if ($before && is_callable($before)) $before($this);

        $functions = $this->Files($this->GetPath('Functions'));
        foreach ($functions as $function) $this->File($function);

        $classes = $this->Files($this->GetPath('Classes'));
        foreach ($classes as $class) $this->File($class);

        $libraries = $this->Files($this->GetPath('Libraries'));
        foreach ($libraries as $library) $this->File($library);

        $models = $this->Files($this->GetPath('Models'));
        foreach ($models as $model) $this->File($model);

        $controllers = $this->Files($this->GetPath('Controllers'));
        foreach ($controllers as $controller) $this->File($controller);

        $modules = $this->Folders($this->GetPath('Modules'));
        foreach ($modules as $module) {
            if (!file_exists($module . '/module.php')) continue;
            $this->File($module . '/module.php');
        }

        $plugins = $this->Folders(PluginsPath);
        foreach ($plugins as $plugin) {
            if (!file_exists($plugin . '/plugin.php')) continue;
            $this->File($plugin . '/plugin.php');
        }

        if ($after && is_callable($after)) $after($this);
    }

    public function Loaded(?callable $before = null, ?callable $after = null) {
        if ($before && is_callable($before)) $before($this);

        if ($after && is_callable($after)) $after($this);
    }

    public function Process(?callable $before = null, ?callable $after = null) {
        if ($before && is_callable($before)) $before($this);

        $this->route->Process();

        if ($after && is_callable($after)) $after($this);

        Database::Close();
    }

    public function Close(?callable $before = null, ?callable $after = null) {
        if ($before && is_callable($before)) $before($this);

        $this->response->Close();

        if ($after && is_callable($after)) $after($this);
    }
}
