<?php
class Request {

    public function __construct(Application $application, array $get, array $post, array $files) {
        $this->application = $application;

        $this->get = $get;
        $this->post = $post;
        $this->files = $files;

        if ($errors = Session::Get('Post.Errors')) {
            Session::Set('Post.Errors', null);
            $this->errors = $errors ? Serialize::Decode($errors) : [];
        }

        if ($post = Session::Get('Post.Data')) {
            Session::Set('Post.Data', null);
            if (!$this->post) $this->post = Serialize::Decode($post);
        }
    }

    private ?Application $application = null;

    private array $get = [];
    private array $post = [];
    private array $files = [];
    private array $errors = [];

    public function __get(string $propertyName) {
        switch ($propertyName) {
            case 'Application':
                return $this->application;
            case 'Files':
                return $this->files;
        }
    }

    public function Get(string $name, mixed $defaultvalue = null): mixed {
        return isset($this->get[$name]) ? $this->get[$name] : $defaultvalue;
    }

    public function UpdatePost(array $data = []): void {
        $this->post = array_merge($this->post, $data);
    }

    public function Post(string $name, mixed $defaultvalue = null): mixed {
        return isset($this->post[$name]) ? $this->post[$name] : $defaultvalue;
    }

    public function Error(string $name): array {
        return isset($this->errors[$name]) ? $this->errors[$name] : [];
    }

    public function Errors(): array {
        return $this->errors;
    }

    public function PostValidate(array $array): bool {
        $errors = [];
        Session::Set('Post.Errors', Serialize::Encode($errors));
        Session::Set('Post.Data', Serialize::Encode($this->post));

        foreach ($array as $name => $conditions) {
            $value = $this->Post($name);

            $subErrors = [];

            if (in_array('required', $conditions) && ($value === null || $value === '')) $subErrors[] = "Field {$name} is required.";

            $type = 'string';
            if (in_array('int', $conditions)) $type = 'int';
            if (in_array('float', $conditions)) $type = 'float';
            if (in_array('email', $conditions)) $type = 'email';
            if (in_array('domain', $conditions)) $type = 'domain';
            if (in_array('url', $conditions)) $type = 'url';

            switch ($type) {
                case 'int':
                    if ($value && !filter_var($value, FILTER_VALIDATE_INT)) $subErrors[] = "Field {$name} must be type of int.";
                    break;
                case 'float':
                    if ($value && !filter_var($value, FILTER_VALIDATE_FLOAT)) $subErrors[] = "Field {$name} must be type of float.";
                    break;
                case 'email':
                    if ($value && !filter_var($value, FILTER_VALIDATE_EMAIL)) $subErrors[] = "Field {$name} must be type of email.";
                    break;
                case 'domain':
                    if ($value && !filter_var($value, FILTER_VALIDATE_DOMAIN)) $subErrors[] = "Field {$name} must be type of domain.";
                    break;
                case 'url':
                    if ($value && !filter_var($value, FILTER_VALIDATE_URL)) $subErrors[] = "Field {$name} must be type of url.";
                    break;
            }

            foreach ($conditions as $condition) {
                $condition = explode(':', $condition);
                if (!in_array('greater', $condition)) continue;
                $greater = $condition[1];
                if (intval($value) < $greater) $subErrors[] = "Field {$name} must be greater than {$greater}.";
            }

            foreach ($conditions as $condition) {
                $condition = explode(':', $condition);
                if (!in_array('less', $condition)) continue;
                $less = $condition[1];
                if (intval($value) > $less) $subErrors[] = "Field {$name} must be less than {$less}.";
            }

            foreach ($conditions as $condition) {
                $condition = explode(':', $condition);
                if (!in_array('min', $condition)) continue;
                $min = $condition[1];
                if (strlen($value) < $min) $subErrors[] = "Field {$name} must contains minimum {$min} characters.";
            }

            foreach ($conditions as $condition) {
                $condition = explode(':', $condition);
                if (!in_array('max', $condition)) continue;
                $max = $condition[1];
                if (strlen($value) > $max) $subErrors[] = "Field {$name} must contains maximum {$max} characters.";
            }

            if ($subErrors) $errors[$name] = $subErrors;
        }

        if ($errors) {
            Session::Set('Post.Errors', Serialize::Encode($errors));
            return false;
        }

        return true;
    }

    public function PostArray(array $array, array $post = []): array {
        foreach ($array as $key => $type) {
            $value = $this->Post($key);
            if ($value === null) continue;

            switch ($type) {
                case 'int':
                    $post[$key] = intval($value);
                    break;
                case 'float':
                    $post[$key] = floatval($value);
                    break;
                case 'bool':
                    $post[$key] = $value == 'on' || $value == 'true' || boolval($value);
                    break;
                case 'json':
                    $post[$key] = Json::Encode($value);
                    break;
                default:
                    $post[$key] = strval($value);
                    break;
            }
        }
        return $post;
    }

    public function File(string $name): ?array {
        return isset($this->files[$name]) ? $this->files[$name] : null;
    }

    public function RequestMethod(): string {
        return Server::Get('REQUEST_METHOD');
    }

    public function RequestUriString(): string {
        return explode('?', Server::Get('REQUEST_URI'))[0];
    }

    public function RequestUri(): ?RequestUri {
        return new RequestUri(Server::Get('REQUEST_URI'));
    }
}
