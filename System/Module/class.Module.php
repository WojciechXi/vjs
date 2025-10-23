<?php
class Module extends Load {

    public static function GetModules(): array {
        return ArrayWhere(get_declared_classes(), function (string $class): bool {
            return is_subclass_of($class, static::class);
        });
    }

    public function __construct(Application $application) {
        $this->application = $application;
        $this->request = $application->Request;
        $this->route = $application->Route;

        $reflectionClass = new ReflectionClass($this);
        $path = dirname($reflectionClass->getFileName());

        $this->SetPath('Config', realpath($path) . '/Config');
        $this->SetPath('Functions', realpath($path) . '/Functions');
        $this->SetPath('Cache', realpath($path) . '/Cache');
        $this->SetPath('Assets', realpath($path) . '/Assets');
        $this->SetPath('Resources', realpath($path) . '/Resources');
        $this->SetPath('Classes', realpath($path) . '/Classes');
        $this->SetPath('Libraries', realpath($path) . '/Libraries');
        $this->SetPath('Models', realpath($path) . '/Models');
        $this->SetPath('Controllers', realpath($path) . '/Controllers');
        $this->SetPath('Modules', realpath($path) . '/Modules');
        $this->SetPath('Routes', realpath($path) . '/Routes');
        $this->SetPath('Views', realpath($path) . '/Views');

        $this->Init();
        $this->Load();
        $this->Initialized();
    }

    protected ?Application $application = null;
    protected ?Request $request = null;
    protected ?Route $route = null;

    protected array $paths = [];

    public function __get(string $propertyName) {
        switch ($propertyName) {
            case 'Application':
                return $this->application;
            case 'Route':
                return $this->route;
        }
    }

    public function File(string $file, array $pass = [], bool $mergeData = true) {
        $pass['application'] = $this->application;
        $pass['module'] = $this->module;
        $pass['request'] = $this->request;
        return parent::File($file, $pass, $mergeData);
    }

    public function Init() {
    }

    public function Load() {
        $classes = $this->Files($this->GetPath('Classes'));
        foreach ($classes as $class) $this->File($class);

        $functions = $this->Files($this->GetPath('Functions'));
        foreach ($functions as $function) $this->File($function);

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
    }

    public function Initialized() {
    }
}
