<?php
class Migration {

    public static function HasAttribute(ReflectionProperty $reflectionProperty, string $attribute): bool {
        $reflectionAttributes = $reflectionProperty->getAttributes();
        foreach ($reflectionAttributes as $reflectionAttribute) if ($reflectionAttribute->getName() == $attribute) return true;
        return false;
    }

    public static function Migrate(): bool {
        $classes = get_declared_classes();

        foreach ($classes as $class) {
            if (!is_subclass_of($class, Model::class)) continue;
            if (!isset($class::$table) || !$class::$table) continue;
            if (!isset($class::$primaryKey) || !$class::$primaryKey) continue;

            $table = Table::Create($class::$table, function (Table $table) use ($class) {
                $reflectionClass = new ReflectionClass($class);
                $reflectionProperties = $reflectionClass->getProperties(ReflectionProperty::IS_PUBLIC | ReflectionProperty::IS_PROTECTED);

                $order = [
                    'int' => 0,
                    'float' => 1,
                    'double' => 2,
                    'string' => 3,
                    '?string' => 4,
                    'bool' => 5,
                    'array' => 6,
                ];

                usort($reflectionProperties, function (ReflectionProperty $l, ReflectionProperty $r) use ($order) {
                    if (!$l->getType() && !$r->getType()) return 0;
                    if (!$l->getType()) return 1;
                    if (!$r->getType()) return -1;

                    $lPrimary = static::HasAttribute($l, 'PrimaryKey');
                    $rPrimary = static::HasAttribute($r, 'PrimaryKey');
                    if ($lPrimary != $rPrimary) return $lPrimary ? -1 : 1;

                    $lDateTime = static::HasAttribute($l, 'DateTime');
                    $rDateTime = static::HasAttribute($r, 'DateTime');
                    if ($lDateTime != $rDateTime) return $lDateTime ? 1 : -1;

                    $lDate = static::HasAttribute($l, 'Date');
                    $rDate = static::HasAttribute($r, 'Date');
                    if ($lDate != $rDate) return $lDate ? 1 : -1;

                    $lWeight = $order[$l->getType()->__toString()];
                    $rWeight = $order[$r->getType()->__toString()];
                    if ($lWeight != $rWeight) return $lWeight - $rWeight;

                    $lIndex = static::HasAttribute($l, 'Index');
                    $rIndex = static::HasAttribute($r, 'Index');
                    if ($lIndex != $rIndex) return $lIndex ? -1 : 1;

                    return strcmp($l->getName(), $r->getName());
                });

                foreach ($reflectionProperties as $reflectionProperty) {
                    if ($reflectionProperty->isStatic()) continue;

                    if (!$reflectionProperty->getType()) continue;
                    if (in_array($reflectionProperty->getName(), ['database', 'table', 'icon'])) continue;

                    $name = $reflectionProperty->getName();
                    $type = $reflectionProperty->getType()->getName();
                    $defaultValue = $reflectionProperty->getDefaultValue();

                    if (static::HasAttribute($reflectionProperty, 'DateTime')) {
                        $table->DateTime($name);
                    } else if (static::HasAttribute($reflectionProperty, 'Date')) {
                        $table->Date($name);
                    } else {
                        $index = static::HasAttribute($reflectionProperty, 'Index');
                        switch ($reflectionProperty->getType()) {
                            case 'bool':
                                $table->Bool($name, $defaultValue, $index);
                                break;
                            case 'int':
                                $primaryKey = static::HasAttribute($reflectionProperty, 'PrimaryKey');
                                $autoIncrement = static::HasAttribute($reflectionProperty, 'AutoIncrement');
                                $table->Int($name, $defaultValue, $index, $primaryKey, $autoIncrement);
                                break;
                            case 'float':
                                $table->Float($name, $defaultValue, $index);
                                break;
                            case '?string':
                                $table->LongText($name);
                                break;
                            case 'string':
                                $table->Varchar($name, 255, $defaultValue, $index);
                                break;
                            default:
                                print_r([$type, $name, $defaultValue]);
                                die;
                        }
                    }
                }
            });

            $success = true;
            if ($table->Exists()) {
                $success = $table->Update();
            } else {
                $success = $table->Insert();
                $class::Defaults();
            }

            if (!$success) return false;
        }

        return true;
    }
}
