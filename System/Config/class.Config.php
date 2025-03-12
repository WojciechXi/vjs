<?php
class Config {

    public function __construct(Application $application) {
        $this->application = $application;

        $this->data = (object)[];
        $this->Read();
    }

    private ?Application $application = null;

    private ?object $data = null;

    public function __get(string $propertyName) {
        if (!isset($this->data->$propertyName)) $this->$propertyName = null;
        return $this->data->$propertyName;
    }

    public function __set(string $propertyName, mixed $value) {
        $this->data->$propertyName = $value;
        $this->Write();
    }

    public function Read(): bool {
        $path = $this->application->GetPath("Config") . "/Config.json";
        if (!file_exists($path)) return false;
        $json = file_get_contents($path);
        $this->data = (object)json_decode($json);
        return true;
    }

    public function Write(): int|false {
        $path = $this->application->GetPath("Config") . "/Config.json";
        $json = json_encode($this->data, JSON_PRETTY_PRINT);
        return file_put_contents($path, $json);
    }
}
