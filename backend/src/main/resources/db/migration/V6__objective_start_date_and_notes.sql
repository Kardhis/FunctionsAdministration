-- Add start_date + notes to objectives
-- MySQL 8+; guard with INFORMATION_SCHEMA for safe re-runs.

SET @db := DATABASE();

-- start_date
SET @stmt := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'objectives' AND COLUMN_NAME = 'start_date'
    ),
    'SELECT 1',
    'ALTER TABLE objectives ADD COLUMN start_date DATE NOT NULL AFTER created_at'
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

-- Backfill start_date from created_at when possible
UPDATE objectives
SET start_date = DATE(created_at)
WHERE start_date IS NULL OR start_date = '0000-00-00';

