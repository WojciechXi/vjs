<?php
class Table {

    public static function Create(string $name, callable $callback): Table {
        $table = new Table($name);
        $callback($table);
        return $table;
    }

    public function __construct(string $name) {
        $this->name = $name;
    }

    private string $name = '';
    private array $columnsName = [];
    private array $columns = [];
    private string $primaryKey = '';
    private array $indexes = [];
    private array $indexesName = [];

    public function Exists(): bool {
        return mysqli_num_rows(Database::Sql("SHOW TABLES LIKE '{$this->name}'"));
    }

    public function GetColumns() {
        $results = Database::Sql("SHOW COLUMNS FROM `{$this->name}`");
        $columns = [];
        while ($results && $object = mysqli_fetch_object($results)) $columns[] = $object;
        return $columns;
    }

    public function Column(string $name, string $type, string $null, string $default, bool $index = false, bool $primaryKey = false): bool {
        $this->columns[] = "`{$name}` {$type} {$null} {$default}";
        $this->columnsName[] = $name;
        if ($index) {
            $this->indexes[] = "INDEX( `{$name}` )";
            $this->indexesName[] = $name;
        }
        if ($primaryKey) $this->primaryKey = "PRIMARY KEY (`{$name}`)";
        return true;
    }

    public function Bool(string $name, bool $default = false, bool $index = false): bool {
        $default = $default ? 'TRUE' : 'FALSE';
        return $this->Column($name, "BOOLEAN", "NOT NULL", "DEFAULT {$default}", $index);
    }

    public function Int(string $name, int $default = 0, bool $index = false, bool $primaryKey = false, bool $autoIncrement = false): bool {
        return $this->Column($name, "INT", "NOT NULL", $autoIncrement ? "AUTO_INCREMENT" : "DEFAULT '{$default}'", $index, $primaryKey);
    }

    public function Float(string $name, float $default = 0, bool $index = false): bool {
        return $this->Column($name, "FLOAT", "NOT NULL", "DEFAULT '{$default}'", $index);
    }

    public function Varchar(string $name, int $length = 255, string $default = '', bool $index = false): bool {
        return $this->Column($name, "VARCHAR({$length})", "NOT NULL", "DEFAULT '{$default}'", $index);
    }

    public function Text(string $name): bool {
        return $this->Column($name, 'TEXT', 'NULL', 'DEFAULT NULL');
    }

    public function LongText(string $name): bool {
        return $this->Column($name, 'LONGTEXT', 'NULL', 'DEFAULT NULL');
    }

    public function Date(string $name): bool {
        return $this->Column($name, "DATE", "NOT NULL", "DEFAULT CURRENT_TIMESTAMP");
    }

    public function DateTime(string $name): bool {
        return $this->Column($name, "DATETIME", "NOT NULL", "DEFAULT CURRENT_TIMESTAMP");
    }

    public function Insert(): bool {
        $columns = [];
        foreach ($this->columns as $column) $columns[] = $column;
        if ($this->primaryKey) $columns[] = $this->primaryKey;
        foreach ($this->indexes as $index) $columns[] = $index;

        $sql = ["CREATE TABLE IF NOT EXISTS `{$this->name}` ("];
        $sql[] = implode(",\n", $columns);
        $sql[] = ") ENGINE = InnoDB";
        $sql = implode(" \n", $sql);

        return Database::Sql($sql);
    }

    public function Update(): bool {
        $columns = $this->GetColumns();
        foreach ($this->columnsName as $index => $columnName) {
            foreach ($columns as $column) if ($column->Field == $columnName) continue 2;

            $data = $this->columns[$index];

            $sql = ["ALTER TABLE `{$this->name}` ADD {$data}"];
            if (in_array($columnName, $this->indexesName)) $sql[] = "ADD INDEX( `{$columnName}` )";
            $sql = join(', ', $sql);

            if (!Database::Sql($sql)) return false;
        }
        return true;
    }
}
