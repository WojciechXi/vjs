<?php
class Response {

    public function __construct(Application $application) {
        $this->application = $application;
    }

    private ?Application $application = null;

    private int $responseCode = 200;

    private string $contentType = 'text/html';
    private string $redirect = '';

    private string $content = '';
    private string $file = '';

    public function ContentType(string $contentType): self {
        $this->contentType = $contentType;
        return $this;
    }

    public function Code(int $responseCode): self {
        $this->responseCode = $responseCode;
        return $this;
    }

    public function Content(string $content): self {
        $this->content = $content;
        return $this;
    }

    public function Redirect(string $redirect): self {
        $this->redirect = $redirect;
        return $this;
    }

    public function Json(mixed $content): self {
        return $this->ContentType('application/json')->Content(Json::Encode($content));
    }

    public function Xml(mixed $content): self {
        return $this->ContentType('text/xml')->Content($content);
    }

    public function Html(string $content): self {
        return $this->ContentType('text/html')->Content($content);
    }

    public function Css(string $content): self {
        return $this->ContentType('text/css')->Content($content);
    }

    public function JavaScript(string $content): self {
        return $this->ContentType('text/javascript')->Content($content);
    }

    public function File(string $path): self {
        $mimeType = mime_content_type($path);
        $this->ContentType($mimeType);
        $this->file = $path;
        return $this;
    }

    public function Close() {
        http_response_code($this->responseCode);
        header("Content-type: {$this->contentType}");
        header("Response-type: {$this->contentType}");
        header('Access-Control-Allow-Origin: *');
        if ($this->redirect) header("Location: {$this->redirect}");
        if ($this->file) {
            $pathInfo = pathinfo($this->file);
            $file = "{$pathInfo['filename']}.{$pathInfo['extension']}";
            header($_SERVER["SERVER_PROTOCOL"] . " 200 OK");
            header("Cache-Control: public");
            header("Content-Transfer-Encoding: Binary");
            header("Content-Length:" . filesize($this->file));
            header("Content-Disposition: inline; filename={$file}");
            die(readfile($this->file));
        } else {
            die($this->content);
        }
    }
}
