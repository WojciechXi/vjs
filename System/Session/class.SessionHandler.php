<?php
class SessionHandler implements SessionHandlerInterface {

    public function read(string $id): string|false {
        return false;
    }

    public function write(string $id, string $data): bool {
        return false;
    }

    public function open(string $path, string $name): bool {
        return false;
    }

    public function close(): bool {
        return false;
    }

    public function destroy(string $id): bool {
        return false;
    }

    public function gc(int $max_lifetime): int|false {
        return false;
    }
}
