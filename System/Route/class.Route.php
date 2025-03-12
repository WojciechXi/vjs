<?php
class Route {

    public function __construct(Application $application, Request $request, Response $response) {
        $this->application = $application;
        $this->request = $request;
        $this->response = $response;
    }

    private ?Application $application = null;
    private ?Request $request = null;
    private ?Response $response = null;

    private string $prefix = '';
    private string $order = '0';
    private array $routes = [];

    public function SetPrefix(string $prefix = null): string {
        return $this->prefix = strval($prefix);
    }

    public function SetOrder(int $order = null): string {
        return $this->order = strval($order);
    }

    private function Route(string $requestMethod, string $requestUri, array|callable $callable, callable $verify = null, string $order = null): void {
        $requestUri = "{$this->prefix}{$requestUri}";
        if ($order === null) $order = $this->order;
        if (!array_key_exists($order, $this->routes)) $this->routes[$order] = [];
        if (is_array($callable)) {
            $this->routes[$order][] = (object)[
                'requestMethod' => $requestMethod,
                'requestUri' => new RequestUri($requestUri),
                'controller' => isset($callable[0]) ? $callable[0] : '',
                'method' => isset($callable[1]) ? $callable[1] : 'Index',
                'verify' => $verify,
            ];
        } else {
            $this->routes[$order][] = (object)[
                'requestMethod' => $requestMethod,
                'requestUri' => new RequestUri($requestUri),
                'callable' => $callable,
                'verify' => $verify,
            ];
        }
    }

    public function Any(string $requestUri, array|callable $callable, callable $verify = null, string $order = null): void {
        $this->Route('ANY', $requestUri, $callable, $verify, $order);
    }

    public function Get(string $requestUri, array|callable $callable, callable $verify = null, string $order = null): void {
        $this->Route('GET', $requestUri, $callable, $verify, $order);
    }

    public function Post(string $requestUri, array|callable $callable, callable $verify = null, string $order = null): void {
        $this->Route('POST', $requestUri, $callable, $verify, $order);
    }

    public function Put(string $requestUri, array|callable $callable, callable $verify = null, string $order = null): void {
        $this->Route('PUT', $requestUri, $callable, $verify, $order);
    }

    public function Delete(string $requestUri, array|callable $callable, callable $verify = null, string $order = null): void {
        $this->Route('DELETE', $requestUri, $callable, $verify, $order);
    }

    public function Process(): mixed {
        $requestMethod = $this->request->RequestMethod();
        $requestUri = $this->request->RequestUri();

        uksort($this->routes, function ($a, $b) {
            return intval($a) - intval($b);
        });

        foreach ($this->routes as $order => $routes) {
            foreach ($routes as $name => $route) {
                $routeRequestMethod = $route->requestMethod;
                if ($routeRequestMethod != 'ANY' && $routeRequestMethod != $requestMethod) continue;

                $routeRequestUri = $route->requestUri;
                if (!$routeRequestUri->Verify($requestUri)) continue;

                $params = $routeRequestUri->Parse($requestUri);
                if (is_callable($route->verify) && !$this->VerifyRoute($route, $params)) continue;

                return $this->ProcessRoute($route, $params);
            }
        }
        return null;
    }

    private function VerifyRoute(object $route, array $params): bool {
        if (!isset($route->verify) || !is_callable($route->verify)) return true;
        return $this->Invoke($route->verify, $params);
    }

    private function ProcessRoute(object $route, array $params = []): ?Response {
        if (isset($route->callable)) return $this->Invoke($route->callable, $params);
        else if (isset($route->controller) && isset($route->method)) {
            $controller = new ($route->controller)($this->application);
            $reflectionMethod = new ReflectionMethod($controller, $route->method);
            return $this->Invoke($reflectionMethod->getClosure($controller), $params);
        }
        return null;
    }

    private function Invoke(callable $function, array $params): mixed {
        $reflectionFunction = new ReflectionFunction($function);
        $reflectionParameters = $reflectionFunction->getParameters();

        $args = [];
        foreach ($reflectionParameters as $reflectionParameter) {
            $key = $reflectionParameter->getName();
            $type = $reflectionParameter->getType()->getName();

            if (array_key_exists($key, $params) && strpos(gettype($params[$key]), $type) !== false) {
                $args[$key] = $params[$key];
                continue;
            }

            if ($key == 'params' && $type == 'array') {
                $args[$key] = $params;
                continue;
            }

            if (is_subclass_of($type, Model::class)) {
                $args[$key] = ($type)::ById(intval($params[$key]));
                continue;
            }

            switch ($type) {
                case Application::class:
                    $args[$key] = $this->application;
                    break;
                case Request::class:
                    $args[$key] = $this->request;
                    break;
                case Response::class:
                    $args[$key] = $this->response;
                    break;
                default:
                    $args[$key] = $reflectionParameter->getDefaultValue();
                    break;
            }
        }

        return $reflectionFunction->invokeArgs($args);
    }
}
