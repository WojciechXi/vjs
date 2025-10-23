<?php
function Path(string $path): string {
    return RootPath . "/{$path}";
}

function Url(string $path): string {
    return RootUrl . "/{$path}";
}

function AssetsPath(string $path): string {
    return AssetsPath . "/{$path}";
}

function AssetsUrl(string $path): string {
    return AssetsUrl . "/{$path}";
}

function UploadsPath(string $path): string {
    return UploadsPath . "/{$path}";
}

function UploadsUrl(string $path): string {
    return UploadsUrl . "/{$path}";
}

function PluginsPath(string $path): string {
    return PluginsPath . "/{$path}";
}

function PluginsUrl(string $path): string {
    return PluginsUrl . "/{$path}";
}

function ArrayFind(array $array, callable $where): mixed {
    foreach ($array as $key => $value) if ($where($value, $key)) return $value;
    return null;
}

function ArrayWhere(array $array, callable $where): array {
    $newArray = [];
    foreach ($array as $key => $value) if ($where($value, $key)) $newArray[$key] = $value;
    return $newArray;
}

function ObjectValue(?object $target, string $key, mixed $defaultValue = null): mixed {
    if (!$target) return $defaultValue;
    if (isset($target->$key) && $target->$key) return $target->$key;
    return $defaultValue;
}

function StartOb(): void {
    ob_start();
}

function EndOb(): string {
    $content = ob_get_contents();
    ob_end_clean();
    return trim($content);
}

function Ob(callable $callable): string {
    StartOb();
    $callable();
    return EndOb();
}

function Css(array|object $css = null): string {
    if (!$css) return '';
    $css = (array)$css;
    foreach ($css as $key => $value) {
        if ($value) $css[$key] = "{$key}: {$value};";
        else $css[$key] = null;
    }
    $css = array_diff($css, ['', null]);
    $css = implode(' ', $css);
    return $css;
}

function Attr(array|object $attr = null): string {
    if (!$attr) return '';
    $attr = (array)$attr;
    foreach ($attr as $key => $value) {
        if ($value || $value == '0' && !is_array($value) && !is_object($value)) $attr[$key] = "{$key}=\"{$value}\"";
        else $attr[$key] = null;
    }
    $attr = array_diff($attr, ['', null]);
    $attr = implode(' ', $attr);
    return $attr;
}

function FormPut(): string {
    return '<input type="hidden" name="REQUEST_METHOD" value="PUT">';
}

function FormDelete(): string {
    return '<input type="hidden" name="REQUEST_METHOD" value="DELETE">';
}

function TrimObject(object $input, array|object $defaultValues = []): object {
    foreach ($input as $key => $value) {
        if (is_string($value)) $input->$key = trim($value);
    }

    foreach ($defaultValues as $key => $value) {
        if (!isset($input->$key)) $input->$key = $value;
    }

    return $input;
}

function Slug(string $string, string $separator = '-') {
    // $string = transliterator_transliterate('Any-Latin; Latin-ASCII; [\u0080-\u7fff] remove', $string);
    $string = preg_replace('~[^\pL\d]+~u', $separator, $string);
    $string = iconv('UTF-8', 'US-ASCII//TRANSLIT', $string);
    $string = preg_replace('~[^-\w]+~', '', $string);
    $string = trim($string, $separator);
    $string = preg_replace('~-+~', $separator, $string);
    $string = strtolower($string);
    return empty($string) ? 'n-a' : $string;
}

function DayOfWeek(string $date): int {
    $dayOfWeek = date('w', strtotime($date));
    if (!$dayOfWeek) return 6;
    return $dayOfWeek - 1;
}

function CommonSubstring(array $array): string {
    $substr = [];

    $first = $array[0];
    $firstLength = mb_strlen($first);
    for ($i = 0; $i < $firstLength; $i++) {
        $letter = $first[$i];

        foreach ($array as $a) {
            if ($a[$i] != $letter) return implode('', $substr);
        }

        $substr[] = $letter;
    }

    return implode('', $substr);
};
