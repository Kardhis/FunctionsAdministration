-- Ensure objectives.start_date exists and is populated
-- MySQL 8+; safe to run even if partially applied.

SET @db := DATABASE();

-- 1) Add start_date as NULLable first (safe with existing rows)
SET @stmt := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'objectives' AND COLUMN_NAME = 'start_date'
    ),
    'SELECT 1',
    'ALTER TABLE objectives ADD COLUMN start_date DATE NULL AFTER created_at'
  )
);
PREPARE s FROM @stmt;
EXECUTE s;
DEALLOCATE PREPARE s;

-- 2) Backfill from created_at where missing
UPDATE objectives
SET start_date = DATE(created_at)
WHERE start_date IS NULL;

-- 3) Make it NOT NULL if still nullable
SET @stmt := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'objectives' AND COLUMN_NAME = 'start_date' AND IS_NULLABLE = 'YES'
    ),
    'ALTER TABLE objectives MODIFY COLUMN start_date DATE NOT NULL',
    'SELECT 1'
  )
);
PREPARE s FROM @stmt;
EXECUTE s;
DEALLOCATE PREPARE s;

