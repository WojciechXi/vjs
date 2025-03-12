<?php
class RequestUri {

    public function __construct(string $requestUri) {
        $this->requestUri = explode('?', $requestUri)[0];
    }

    private string $requestUri = '/';

    public function __get(string $propertyName) {
        switch ($propertyName) {
            case 'RequestUri':
                return $this->requestUri;
            case 'RequestArray':
                return explode('/', $this->requestUri);
        }
    }

    public function Length(): int {
        $requestArray = $this->RequestArray;
        return count($requestArray);
    }

    public function At(int $index = 0): ?string {
        $requestArray = $this->RequestArray;
        return isset($requestArray[$index]) ? $requestArray[$index] : null;
    }

    public function Verify(RequestUri $requestUri): bool {
        $requestArray = $this->RequestArray;
        foreach ($requestArray as $index => $scheme) {
            if ($scheme == '*') return true;

            $element = $requestUri->At($index);

            if (strpos($scheme, ':') !== false) {
                $element = explode('-', $element ? $element : '');
                $scheme = explode('-', $scheme);
                foreach ($scheme as $index => $s) {
                    if ($s == '-') continue;

                    $s = explode(':', $s);
                    $type = $s[1];

                    switch ($type) {
                        case 'int':
                            if (!filter_var($element[$index], FILTER_VALIDATE_INT)) return false;
                            break;
                        case 'float':
                            $element[$index] = floatval($element[$index]);
                            if (!filter_var($element[$index], FILTER_VALIDATE_FLOAT)) return false;
                            break;
                    }
                }

                continue;
            }

            if ($element != $scheme) return false;
        }

        return count($requestArray) == count($requestUri->RequestArray);
    }

    public function Parse(RequestUri $requestUri): array {
        $requestArray = $this->RequestArray;
        $params = [];

        foreach ($requestArray as $index => $scheme) {
            if (strpos($scheme, ':') !== false) {
                $element = $requestUri->At($index);
                $scheme = explode(':', $scheme);
                $key = $scheme[0];
                $type = $scheme[1];

                switch ($type) {
                    case 'int':
                        $params[$key] = intval($element);
                        break;
                    case 'float':
                        $params[$key] = floatval($element);
                        break;
                    case 'string':
                        $params[$key] = strval($element);
                        break;
                }
            }
        }

        return $params;
    }
}
