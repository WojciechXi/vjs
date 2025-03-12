<?php
class Graphics {

    public static function ScaleWithAspect(string $filePath, string $savePath, int $size = 1080): bool {
        if (!file_exists($filePath)) return false;

        list($sourceWidth, $sourceHeight) = getimagesize($filePath);
        if (!$sourceWidth || !$sourceHeight) return false;

        $aspectRatio = $sourceWidth / $sourceHeight;

        $newWidth = $size;
        $newHeight = $size / $aspectRatio;

        if ($newHeight > $size) {
            $newHeight = $size;
            $newWidth = $size * $aspectRatio;
        }

        $newWidth = intval($newWidth);
        $newHeight = intval($newHeight);

        return static::Scale($filePath, $savePath, $newWidth, $newHeight);
    }

    public static function Scale(string $filePath, string $savePath, int $newWidth, int $newHeight): bool {
        if (!file_exists($filePath)) return false;
        if ($newWidth < 1) $newWidth = 1;
        if ($newHeight < 1) $newHeight = 1;

        $mimeType = mime_content_type($filePath);

        switch ($mimeType) {
            case 'image/jpg':
            case 'image/jpeg':
                $source = imagecreatefromjpeg($filePath);
                break;
            case 'image/png':
                $source = imagecreatefrompng($filePath);
                break;
            case 'image/gif':
                $source = imagecreatefromgif($filePath);
                break;
            case 'image/webp':
                $source = imagecreatefromwebp($filePath);
                break;
            default:
                return null;
        }

        if (!$source) return null;

        list($sourceWidth, $sourceHeight) = getimagesize($filePath);

        $image = imagecreatetruecolor($newWidth, $newHeight);

        if (in_array($mimeType, ['image/png', 'image/webp'])) {
            imagealphablending($image, false);
            imagesavealpha($image, true);

            $transparent = imagecolorallocatealpha($image, 255, 255, 255, 127);
            imagefilledrectangle($image, 0, 0, $newWidth, $newHeight, $transparent);
        }

        // $image = imagescale($source, $newWidth, $newHeight);
        imagecopyresampled($image, $source, 0, 0, 0, 0, $newWidth, $newHeight, $sourceWidth, $sourceHeight);

        $success = false;

        switch ($mimeType) {
            case 'image/png':
                $success = imagepng($image, $savePath, 9);
                break;
            case 'image/webp':
                $success = imagewebp($image, $savePath, 75);
                break;
            case 'image/gif':
                $success = imagegif($image, $savePath);
                break;
            default:
                $success = imagejpeg($image, $savePath, 75);
                break;
        }

        imagedestroy($source);
        imagedestroy($image);

        return $success;
    }
}
