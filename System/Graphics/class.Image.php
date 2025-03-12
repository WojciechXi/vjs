<?php
class Image {

    public function __construct(string $path) {
        $this->path = $path;
        switch ($this->GetMimeType()) {
            case 'image/jpg':
            case 'image/jpeg':
                $this->image = imagecreatefromjpeg($this->path);
                break;
            case 'image/png':
                $this->image = imagecreatefrompng($this->path);
                break;
            case 'image/gif':
                $this->image = imagecreatefromgif($this->path);
                break;
            case 'image/webp':
                $this->image = imagecreatefromwebp($this->path);
                break;
        }
    }

    private string $path = '';
    private ?GdImage $image = null;

    public function GetMimeType(): string {
        return mime_content_type($this->path);
    }

    public function GetWidth(): int {
        if (!$this->image) return 0;
        return imagesx($this->image);
    }

    public function GetHeight(): int {
        if (!$this->image) return 0;
        return imagesy($this->image);
    }

    public function Scale(int $width, int $height): bool {
        if (!$this->image) return false;
        if ($width < 1) $width = 1;
        if ($height < 1) $height = 1;

        $image = imagecreatetruecolor($width, $height);
        $background = imagecolorallocatealpha($image, 255, 255, 255, 127);
        imagecolortransparent($image, $background);
        imagealphablending($image, false);
        imagesavealpha($image, true);

        imagecopyresized($image, $this->image, 0, 0, 0, 0, $width, $height, $this->GetWidth(), $this->GetHeight());

        $this->Dispose();

        $this->image = $image;
        return true;
    }

    public function ScaleWidthAspect(int $maxSize): bool {
        if (!$this->image) return false;
        $width = $this->GetWidth();
        $height = $this->GetHeight();

        $aspectRatio = $width / $height;

        if ($width > $maxSize) {
            $width = $maxSize;
            $height = round($width / $aspectRatio);
        }

        if ($height > $maxSize) {
            $height = $maxSize;
            $width = round($width * $aspectRatio);
        }

        return $this->Scale($width, $height);
    }

    public function Dispose(): bool {
        return imagedestroy($this->image);
    }

    public function Save(): bool {
        switch ($this->GetMimeType()) {
            case 'image/jpg':
            case 'image/jpeg':
                return imagejpeg($this->image, $this->path);
            case 'image/png':
                return imagepng($this->image, $this->path);
            case 'image/gif':
                return imagegif($this->image, $this->path);
            case 'image/webp':
                return imagewebp($this->image, $this->path);
            default:
                return false;
        }
    }

    public function SaveAs(string $path): bool {
        $pathInfo = pathinfo($path);
        $extension = $pathInfo['extension'];
        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                return imagejpeg($this->image, $path);
            case 'png':
                return imagepng($this->image, $path);
            case 'gif':
                return imagegif($this->image, $path);
            case 'webp':
                return imagewebp($this->image, $path);
            default:
                return false;
        }
    }
}
