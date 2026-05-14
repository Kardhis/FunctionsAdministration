-- Add start_date + notes to objectives (safe with existing rows: nullable first, then NOT NULL).
-- MySQL 8+; idempotent via INFORMATION_SCHEMA.
-- Previous version used NOT NULL on ADD which fails when objectives already has rows.

SET @db := DATABASE();

-- start_date: add nullable if missing
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

UPDATE objectives
SET start_date = DATE(created_at)
WHERE start_date IS NULL;

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

-- notes
SET @stmt := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'objectives' AND COLUMN_NAME = 'notes'
    ),
    'SELECT 1',
    'ALTER TABLE objectives ADD COLUMN notes TEXT NULL AFTER habit_id'
  )
);
PREPARE s FROM @stmt;
EXECUTE s;
DEALLOCATE PREPARE s;
