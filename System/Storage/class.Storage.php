<?php
class Storage {

    public static function Exists(string $file): bool {
        $uploadsPath = UploadsPath;
        $path = "{$uploadsPath}/{$file}";
        return file_exists($path);
    }

    public static function Delete(string $file): bool {
        $uploadsPath = UploadsPath;
        $path = "{$uploadsPath}/{$file}";
        return file_exists($path) ? unlink($path) : false;
    }

    public static function File(string $key): ?array {
        return isset($_FILES[$key]) && $_FILES[$key] ? $_FILES[$key] : null;
    }

    public static function CreateFile(string $name, string $extension, string $content): ?object {
        if ($extension == 'php')  $extension = 'txt';

        $alias = md5(time() . $name);

        $uploadsPath = UploadsPath;
        $newPath = "{$uploadsPath}/{$alias}.{$extension}";

        if (file_put_contents($newPath, $content)) {
            return (object)[
                'name' => $name,
                'extension' => $extension,
                'alias' => $alias,
                'size' => filesize($newPath),
                'type' => mime_content_type($newPath),
                'path' => $newPath,
            ];
        }

        return null;
    }

    public static function SaveFile(array $file): ?object {
        if (!$file) return null;

        $temporaryPath = $file['tmp_name'];
        $pathInfo = pathinfo($file['name']);

        if (!array_key_exists('filename', $pathInfo) || !array_key_exists('extension', $pathInfo)) return null;

        $name = $pathInfo['filename'];
        $extension = $pathInfo['extension'];
        if ($extension == 'php')  $extension = 'txt';
        $alias = md5(time() . $name);

        $uploadsPath = UploadsPath;
        $newPath = "{$uploadsPath}/{$alias}.{$extension}";

        if (move_uploaded_file($temporaryPath, $newPath)) {
            return (object)[
                'name' => $name,
                'extension' => $extension,
                'alias' => $alias,
                'size' => filesize($newPath),
                'type' => mime_content_type($newPath),
                'path' => $newPath,
            ];
        }

        return null;
    }

    public static function SaveFiles(): array {
        $files = [];

        foreach ($_FILES as $key => $file) {
            if (is_array($file['name'])) {
                for ($i = 0; $i < count($file['name']); $i++) {
                    if ($f = static::SaveFile([
                        'name' => $file['name'][$i],
                        'full_path' => $file['full_path'][$i],
                        'type' => $file['type'][$i],
                        'tmp_name' => $file['tmp_name'][$i],
                        'error' => $file['error'][$i],
                        'size' => $file['size'][$i],
                    ])) {
                        $files["{$key}_{$i}"] = $f;
                    }
                }
            } else {
                if ($file = static::SaveFile($file)) $files[$key] = $file;
            }
        }

        return $files;
    }
}
