<?php
class Controller {

    public function __construct(Load $load) {
        $this->load = $load;
        $this->Init();
    }

    protected ?Load $load = null;

    protected function Init() {
    }

    protected function View(string $viewName, array $pass = [], bool $asString = true): ?string {
        return $this->load->View($viewName, $pass, $asString);
    }
}
