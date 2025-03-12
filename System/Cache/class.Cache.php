<?php
class Cache {

    public function __construct(Load $load) {
        $this->load = $load;
    }

    private ?Load $load = null;

    public function Read(string $file, int $timeout = 3600): ?string {
        $cachePath = $this->load->GetPath('Cache');
        $filePath = "{$cachePath}/{$file}";
        if (!file_exists($filePath)) return null;

        $fileTime = filemtime($filePath);
        if (time() - $fileTime > $timeout) return null;

        return file_get_contents($filePath);
    }

    public function Write(string $file, string $content): string {
        $cachePath = $this->load->GetPath('Cache');
        $filePath = "{$cachePath}/{$file}";
        file_put_contents($filePath, $content);
        return $content;
    }
}
