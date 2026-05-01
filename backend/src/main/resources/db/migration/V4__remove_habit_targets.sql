-- Drop habit target/goal columns (no longer used)
-- MySQL 8+; use INFORMATION_SCHEMA guards to be safe across environments.

SET @db := DATABASE();

-- target_type
SET @stmt := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'habits' AND COLUMN_NAME = 'target_type'
    ),
    'ALTER TABLE habits DROP COLUMN target_type',
    'SELECT 1'
  )
);
PREPARE s FROM @stmt;
EXECUTE s;
DEALLOCATE PREPARE s;

-- target_value
SET @stmt := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'habits' AND COLUMN_NAME = 'target_value'
    ),
    'ALTER TABLE habits DROP COLUMN target_value',
    'SELECT 1'
  )
);
PREPARE s FROM @stmt;
EXECUTE s;
DEALLOCATE PREPARE s;

-- target_period
SET @stmt := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'habits' AND COLUMN_NAME = 'target_period'
    ),
    'ALTER TABLE habits DROP COLUMN target_period',
    'SELECT 1'
  )
);
PREPARE s FROM @stmt;
EXECUTE s;
DEALLOCATE PREPARE s;

