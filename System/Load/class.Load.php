<?php
class Load {

    private array $urls = [];
    private array $paths = [];
    private array $items = [];

    private array $temporaryData = [];

    private mixed $onView = null;

    protected ?Config $config = null;
    protected ?Cache $cache = null;
    protected ?Request $request = null;
    protected ?Response $response = null;
    protected ?Route $route = null;

    public function OnView(callable $onView): void {
        $this->onView = $onView;
    }

    public function GetPath(string $name, string $path = null): ?string {
        if (!isset($this->paths[$name])) return null;
        if ($path) return implode('/', [$this->paths[$name], $path]);
        return $this->paths[$name];
    }

    public function SetPath(string $name, string $path): string {
        return $this->paths[$name] = $path;
    }

    public function GetUrl(string $name, string $path = null): ?string {
        if (!isset($this->urls[$name])) return null;
        if ($path) return implode('/', [$this->urls[$name], $path]);
        return $this->urls[$name];
    }

    public function SetUrl(string $name, string $path): string {
        return $this->urls[$name] = $path;
    }

    public function RegisterItem(string $type, string $name, string $value): void {
        if (!isset($this->items[$type])) $this->items[$type] = [];
        $this->items[$type][$name] = $value;
    }

    public function EachItem(string $type, callable $callback): void {
        if (!isset($this->items[$type])) return;
        foreach ($this->items[$type] as $name => $value) $callback($name, $value);
    }

    public function File(string $filePath, array $pass = [], bool $mergeData = true) {
        try {
            if (!$mergeData) {
                extract($pass);
                if (file_exists($filePath)) include $filePath;
                return;
            }

            $oldData = [];
            foreach ($pass as $key => $value) $oldData[$key] = array_key_exists($key, $this->temporaryData) ? $this->temporaryData : null;

            $this->temporaryData = array_merge($this->temporaryData, $pass);
            extract($this->temporaryData);

            if (file_exists($filePath)) include $filePath;

            foreach ($oldData as $key => $value) $this->temporaryData[$key] = $value;
        } catch (Exception $exception) {
            print_r("<div style=\"white-space: pre-wrap;\">{$exception}</div>");
            return null;
        } catch (Error $error) {
            print_r("<div style=\"white-space: pre-wrap;\">{$error}</div>");
            return null;
        }
    }

    public function Controller(string $name, array $pass = []) {
        $controllersPath = $this->GetPath('Controllers');
        $filePath = "{$controllersPath}/{$name}.php";
        $this->File($filePath, $pass);
    }

    public function Model(string $name, array $pass = []) {
        $modelsPath = $this->GetPath('Models');
        $filePath = "{$modelsPath}/{$name}.php";
        $this->File($filePath, $pass);
    }

    public function Route(string $name, array $pass = []) {
        $routesPath = $this->GetPath('Routes');
        $filePath = "{$routesPath}/{$name}.php";
        $this->File($filePath, $pass);
    }

    public function View(string $viewName, array $pass = [], bool $asString = true, bool $mergeData = true): ?string {
        $viewsPath = $this->GetPath('Views');
        $viewPath = "{$viewsPath}/{$viewName}.php";

        if ($this->onView && is_callable($this->onView)) $viewPath = ($this->onView)($this, $viewName, $viewPath);

        if ($asString) return Ob(function () use ($viewPath, $pass, $mergeData) {
            $this->File($viewPath, $pass, $mergeData);
        });

        $this->File($viewPath, $pass, $mergeData);
        return null;
    }

    public function Files(string $path, bool $recursive = true, array $files = []): array {
        if (!file_exists($path)) return $files;

        $items = array_diff(scandir($path), ['.', '..']);

        foreach ($items as $item) {
            $itemPath = "{$path}/{$item}";
            if (!is_file($itemPath)) continue;
            $files[] = $itemPath;
        }

        if ($recursive) {
            foreach ($items as $item) {
                $itemPath = "{$path}/{$item}";
                if (!is_dir($itemPath)) continue;
                $files = $this->Files($itemPath, $recursive, $files);
            }
        }

        return $files;
    }

    public function Folders(string $path, bool $recursive = true, array $folders = []): array {
        if (!file_exists($path)) return $folders;

        $items = array_diff(scandir($path), ['.', '..']);

        foreach ($items as $item) {
            $itemPath = "{$path}/{$item}";
            if (!is_dir($itemPath)) continue;
            $folders[] = $itemPath;
            if ($recursive) $folders = $this->Folders($itemPath, $recursive, $folders);
        }

        return $folders;
    }

    public function RegisterRoutes(string $path, string $prefix = null, int $order = 0) {
        $routes = $this->Files($path);
        $this->route->SetPrefix($prefix);
        $this->route->SetOrder($order);
        foreach ($routes as $route) $this->File($route, [
            'route' => $this->route,
            'application' => $this,
        ]);
        $this->route->SetOrder(0);
        $this->route->SetPrefix('');
    }
}
