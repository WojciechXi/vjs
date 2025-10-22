<?php
class Model implements JsonSerializable {

    //Global

    private static array $cache = [];

    public static string $database = '';
    public static string $table = '';
    protected static string $primaryKey = '';

    public static function Defaults(): array {
        return [];
    }

    public static function GetSubClasses(): array {
        $classes = get_declared_classes();
        $subClasses = [];
        foreach ($classes as $class) if (is_subclass_of($class, static::class)) $subClasses[] = $class;
        return $subClasses;
    }

    public static function Query(): ?DatabaseQuery {
        return Database::Query(static::$table, static::$database);
    }

    public static function Insert(object|array $data = []): ?static {
        $query = static::Query();
        $id = $query->Insert($data);
        $model = static::ById($id);
        if ($model) $model->OnInsert();
        return $model;
    }

    public static function ObjectQuery(DatabaseQuery $databaseQuery): ?static {
        $object = $databaseQuery->Object();
        return $object ? new static($object) : null;
    }

    public static function Object(string $where = '', array $values = [], string $join = '', string $joinOn = ''): ?static {
        if (!static::$table) return null;
        $query = static::Query();
        $query->Join($join, $joinOn);
        $query->Where($where, $values);

        $object = static::ObjectQuery($query);

        if ($object) {
            $primaryKey = static::$primaryKey;
            if (!array_key_exists(static::class, static::$cache)) static::$cache[static::class] = [];
            static::$cache[static::class][$object->$primaryKey] = $object;
        }

        return $object;
    }

    public static function ObjectsQuery(DatabaseQuery $databaseQuery): array {
        $objects = $databaseQuery->Objects();
        foreach ($objects as $key => $object) $objects[$key] = new static($object);
        return $objects;
    }

    public static function Objects(string $where = '', int $limit = 0, int $offset = 0, string $orderBy = '', array $values = [], string $join = '', string $joinOn = ''): array {
        if (!static::$table) return [];
        $query = static::Query();
        $query->Where($where, $values);
        $query->Join($join, $joinOn);
        $query->Limit($limit);
        $query->Offset($offset);
        $query->OrderBy($orderBy);
        $objects = static::ObjectsQuery($query);

        $primaryKey = static::$primaryKey;
        if (!array_key_exists(static::class, static::$cache)) static::$cache[static::class] = [];
        foreach ($objects as $object) static::$cache[static::class][$object->$primaryKey] = $object;

        return $objects;
    }

    public static function DeleteMany(string $where, int $limit = 0, int $offset = 0, array $values = []): bool {
        if (!static::$table) return false;
        $query = static::Query();
        $query->Where($where, $values);
        $query->Limit($limit);
        $query->Offset($offset);
        return $query->Delete();
    }

    public static function CountQuery(DatabaseQuery $databaseQuery, string $column = null): int {
        if (!static::$table) return 0;
        if (!$column) $column = static::$primaryKey;
        return $databaseQuery->Count($column);
    }

    public static function Count(string $where = '', array $values = [], string $column = null): int {
        if (!static::$table) return 0;
        if (!$column) $column = static::$primaryKey;
        $query = static::Query();
        $query->Where($where, $values);
        return static::CountQuery($query, $column);
    }

    public static function CountDistinctQuery(DatabaseQuery $databaseQuery, string $column = null): int {
        if (!static::$table) return 0;
        if (!$column) $column = static::$primaryKey;
        return $databaseQuery->CountDistinct($column);
    }

    public static function CountDistinct(string $where = '', array $values = [], string $column = null): int {
        if (!static::$table) return 0;
        if (!$column) $column = static::$primaryKey;
        $query = static::Query();
        $query->Where($where, $values);
        return static::CountDistinctQuery($query, $column);
    }

    public static function ById(string|null $primaryValue): ?static {
        if (!static::$table) return null;
        return static::Object(Database::Equals(static::$primaryKey, $primaryValue));
    }

    public static function Many(string $column, string|null $primaryValue, string $orderBy = ''): array {
        if (!static::$table) return [];
        $objects = static::Objects(Database::Equals($column, $primaryValue), 0, 0, $orderBy);
        return $objects;
    }

    //Local

    public function __construct(object $data = null) {
        $this->SetData($data);
    }

    public function GetData(): ?object {
        $primaryKey = static::$primaryKey;
        $query = static::Query();
        $query->Where(Database::Equals($primaryKey, $this->$primaryKey));
        return $query->Object();
    }

    public function SetData(object $data = null): bool {
        if (!$data) return false;
        foreach ($this as $key => $value) $this->$key = isset($data->$key) ? $data->$key : $value;
        return true;
    }

    public function Update(object|array $data): bool {
        if (!static::$table) return false;
        $primaryKey = static::$primaryKey;
        $data = $this->BeforeUpdate($data);

        $query = static::Query();
        $query->Where(Database::Equals($primaryKey, $this->$primaryKey));
        $success = $query->Update($data);
        if ($success) $this->SetData($this->GetData());
        Hook::Invoke([static::class, 'Update'], ['model' => $this, 'success' => $success]);
        $this->OnUpdate($success);

        if (!array_key_exists(static::class, static::$cache)) static::$cache[static::class] = [];
        static::$cache[static::class][$this->$primaryKey] = $this;

        return $success;
    }

    public function Delete(): bool {
        if (!static::$table) return false;
        $primaryKey = static::$primaryKey;
        $this->BeforeDelete();
        $query = static::Query();
        $query->Where(Database::Equals($primaryKey, $this->$primaryKey));
        $query->Limit(1);
        $success = $query->Delete();
        Hook::Invoke([static::class, 'Delete'], ['model' => $this, 'success' => $success]);
        $this->OnDelete($success);
        return $success;
    }

    public function Duplicate(): ?static {
        if (!static::$table) return null;
        $data = (array)$this;
        unset($data[static::$primaryKey]);
        $data = $this->BeforeDuplicate($data);
        $newModel = static::Insert($data);
        $this->OnDuplicate($newModel);
        return $newModel;
    }

    public function OnInsert(): void {
        Hook::Invoke([static::class, 'Insert'], ['model' => $this]);
    }

    public function BeforeUpdate(object|array $data): array {
        return $data;
    }

    public function OnUpdate(bool $success): void {
    }

    public function BeforeDelete(): void {
    }

    public function OnDelete(bool $success): void {
    }

    public function BeforeDuplicate(array $data): array {
        return $data;
    }

    public function OnDuplicate(mixed $newModel): void {
    }

    public function ToJson() {
        return (object)((array)$this);
    }

    public function jsonSerialize(): mixed {
        return $this->ToJson();
    }
}
