<?php
class Curl {

    public function __construct(string $url, string $method = 'GET', array $headers = []) {
        $this->curlHandle = curl_init();

        curl_setopt($this->curlHandle, CURLOPT_URL, $url);
        curl_setopt($this->curlHandle, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($this->curlHandle, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($this->curlHandle, CURLOPT_RETURNTRANSFER, true);
    }

    private CurlHandle|false $curlHandle = false;

    public function Post(string $post, bool $autoClose = true): string|bool {
        curl_setopt($this->curlHandle, CURLOPT_POST, true);
        curl_setopt($this->curlHandle, CURLOPT_POSTFIELDS, $post);
        curl_setopt($this->curlHandle, CURLOPT_CUSTOMREQUEST, 'POST');
        $response = curl_exec($this->curlHandle);
        if ($autoClose) $this->Close();
        return $response;
    }

    public function Get(bool $autoClose = true): string|bool {
        $response = curl_exec($this->curlHandle);
        if ($autoClose) $this->Close();
        return $response;
    }

    public function Close(): bool {
        if ($this->curlHandle) {
            curl_close($this->curlHandle);
            return true;
        }
        return false;
    }
}
