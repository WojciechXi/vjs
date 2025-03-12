<?php
class DatabaseQuery {

    public function __construct(string $table, string $database = null) {
        $this->table = $table;
        $this->database = $database;
    }

    private string $table = '';
    private ?string $database = null;

    private array|string $items = '*';
    private string $where = '';
    private string $groupBy = '';
    private string $orderBy = '';
    private string $join = '';
    private string $joinOn = '';
    private int $limit = 0;
    private int $offset = 0;

    public function Items(array|string $items = '*'): self {
        $this->items = $items;
        return $this;
    }

    public function Limit(int $limit = 0): self {
        $this->limit = $limit;
        return $this;
    }

    public function Offset(int $offset = 0): self {
        $this->offset = $offset;
        return $this;
    }

    public function OrderBy(string $orderBy = ''): self {
        $this->orderBy = $orderBy;
        return $this;
    }

    public function GroupBy(string $groupBy = ''): self {
        $this->groupBy = $groupBy;
        return $this;
    }

    public function Join(string $table, string $on = null): self {
        $this->join = $table;
        if ($on) $this->joinOn = $on;
        return $this;
    }

    public function Where(string $where = '', array $values = []): self {
        foreach ($values as $key => $value) $where = str_replace("%{$key}", Database::RealEscape($value), $where);
        $this->where = $where;
        return $this;
    }

    public function Insert(object|array $data = []): int {
        $sql = $this->InsertSql($data);
        Database::Sql($sql, $this->database);
        return Database::InsertId();
    }

    public function Update(array $data = []): bool {
        $sql = $this->UpdateSql($data);
        if (!$sql) return false;
        return Database::Sql($sql, $this->database);
    }

    public function Delete(): bool {
        $sql = $this->DeleteSql();
        return Database::Sql($sql, $this->database);
    }

    public function Object(): ?object {
        $sql = $this->ObjectSql();
        $results = Database::Sql($sql, $this->database);
        while ($results && $object = mysqli_fetch_object($results)) return $object;
        return null;
    }

    public function Objects(): array {
        $sql = $this->ObjectsSql();
        $results = Database::Sql($sql, $this->database);
        $objects = [];
        while ($results && $object = mysqli_fetch_object($results)) $objects[] = $object;
        return $objects;
    }

    public function Count(string $columnId = 'id'): int {
        $sql = $this->CountSql($columnId);
        $results = Database::Sql($sql, $this->database);
        while ($results && $object = mysqli_fetch_object($results)) return $object->Count;
        return 0;
    }

    public function CountDistinct(string $columnId = 'id'): int {
        $sql = $this->CountDistinctSql($columnId);
        $results = Database::Sql($sql, $this->database);
        while ($results && $object = mysqli_fetch_object($results)) return $object->Count;
        return 0;
    }

    public function InsertSql(object|array $data = []): array {
        $sql = [];
        $sql[] = "INSERT INTO {$this->table}";

        $keys = [];
        $values = [];
        foreach ($data as $key => $value) {
            $key = Database::RealEscape($key);
            $value = Database::RealEscape($value);
            $keys[] = "`{$key}`";
            $values[] = "'{$value}'";
        }
        $keys = implode(', ', $keys);
        $values = implode(', ', $values);

        $sql[] = "( {$keys} ) VALUES ( {$values} )";

        return $sql;
    }

    public function UpdateSql(object|array $data = []): array {
        if (!$data) return [];

        $sql = [];
        $sql[] = "UPDATE {$this->table}";

        foreach ($data as $key => $value) {
            $key = Database::RealEscape($key);
            $value = Database::RealEscape($value);
            $data[$key] = "`{$key}` = '{$value}'";
        }
        $data = implode(', ', $data);

        $sql[] = "SET {$data}";

        if ($this->where) $sql[] = "WHERE {$this->where}";
        if ($this->limit) $sql[] = "LIMIT {$this->limit}";
        if ($this->offset) $sql[] = "OFFSET {$this->offset}";

        return $sql;
    }

    public function DeleteSql(): array {
        $sql = [];
        $sql[] = "DELETE FROM {$this->table}";

        if ($this->where) $sql[] = "WHERE {$this->where}";
        if ($this->limit) $sql[] = "LIMIT {$this->limit}";
        if ($this->offset) $sql[] = "OFFSET {$this->offset}";

        return $sql;
    }

    public function ObjectSql(): array {
        $items = [];
        if (is_array($this->items)) {
            foreach ($this->items as $item) $items[] = "{$this->table}.{$item}";
        } else {
            $items[] = "{$this->table}.{$this->items}";
        }
        $items = join(', ', $items);

        $sql = [];
        $sql[] = "SELECT {$items}";
        $sql[] = "FROM {$this->table}";

        if ($this->join && $this->joinOn) $sql[] = "INNER JOIN {$this->join} ON {$this->joinOn}";
        else if ($this->join) $sql[] = "INNER JOIN {$this->join}";

        if ($this->where) $sql[] = "WHERE {$this->where}";
        if ($this->groupBy) $sql[] = "GROUP BY {$this->groupBy}";
        if ($this->orderBy) $sql[] = "ORDER BY {$this->orderBy}";
        $sql[] = "LIMIT 1";
        if ($this->offset) $sql[] = "OFFSET {$this->offset}";

        return $sql;
    }

    public function ObjectsSql(): array {
        $items = [];
        if (is_array($this->items)) {
            foreach ($this->items as $item) $items[] = "{$this->table}.{$item}";
        } else {
            $items[] = "{$this->table}.{$this->items}";
        }
        $items = join(', ', $items);

        $sql = [];
        $sql[] = "SELECT {$items}";
        $sql[] = "FROM {$this->table}";

        if ($this->join && $this->joinOn) $sql[] = "INNER JOIN {$this->join} ON {$this->joinOn}";
        else if ($this->join) $sql[] = "INNER JOIN {$this->join}";

        if ($this->where) $sql[] = "WHERE {$this->where}";
        if ($this->groupBy) $sql[] = "GROUP BY {$this->groupBy}";
        if ($this->orderBy) $sql[] = "ORDER BY {$this->orderBy}";
        if ($this->limit) $sql[] = "LIMIT {$this->limit}";
        if ($this->offset) $sql[] = "OFFSET {$this->offset}";

        return $sql;
    }

    public function CountSql(string $columnId = 'id'): array {
        $sql = [];
        $sql[] = "SELECT COUNT( {$this->table}.{$columnId} ) as Count";
        $sql[] = "FROM {$this->table}";

        if ($this->join && $this->joinOn) $sql[] = "INNER JOIN {$this->join} ON {$this->joinOn}";
        else if ($this->join) $sql[] = "INNER JOIN {$this->join}";

        if ($this->where) $sql[] = "WHERE {$this->where}";

        return $sql;
    }

    public function CountDistinctSql(string $columnId = 'id'): array {
        $sql = [];
        $sql[] = "SELECT COUNT( DISTINCT {$this->table}.{$columnId} ) as Count";
        $sql[] = "FROM {$this->table}";

        if ($this->join && $this->joinOn) $sql[] = "INNER JOIN {$this->join} ON {$this->joinOn}";
        else if ($this->join) $sql[] = "INNER JOIN {$this->join}";

        if ($this->where) $sql[] = "WHERE {$this->where}";

        return $sql;
    }
}
