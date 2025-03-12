<?php
class Hook {

    private static array $hooks = [];

    public static function Register(string|array $name, callable $callback): void {
        if (is_array($name)) $name = implode('.', $name);
        $hook = array_key_exists($name, static::$hooks) ? static::$hooks[$name] : static::$hooks[$name] = new Hook($name);
        $hook->RegisterCallback($callback);
    }

    public static function Invoke(string|array $name, array $pass = []): bool {
        if (is_array($name)) $name = implode('.', $name);
        if (!array_key_exists($name, static::$hooks)) return false;
        return static::$hooks[$name]->InvokeCallbacks($pass);
    }

    public function __construct(string $name) {
        $this->name = $name;
        $this->callbacks = [];
    }

    private string $name = '';
    private array $callbacks = [];

    public function RegisterCallback(callable $callback): void {
        $this->callbacks[] = $callback;
    }

    public function InvokeCallbacks(array $pass = []): bool {
        foreach ($this->callbacks as $callback) call_user_func_array($callback, $pass);
        return true;
    }
}
