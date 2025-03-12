<?php
class ScriptCompiler {

    public function __construct(string $path = null, string $saveAs = null, Load $load = null) {
        if ($path) {
            $scripts = $load->Files($path);
            $this->AddScripts($scripts);
            if ($saveAs) $this->SaveAs($saveAs);
        }
    }

    private array $scripts = [];

    public function AddScript(string $path): bool {
        if (!file_exists($path)) return false;
        $this->scripts[$path] = file_get_contents($path);
        return true;
    }

    public function AddScripts(array $paths): bool {
        if (!$paths) return false;
        foreach ($paths as $path) $this->AddScript($path);
        return true;
    }

    public function SaveAs(string $path): bool {
        $content = implode("\n\n", $this->scripts);
        return file_put_contents($path, $content);
    }
}
