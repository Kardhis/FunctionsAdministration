-- Ensure objectives.notes exists
-- MySQL 8+; safe to run multiple times.

SET @db := DATABASE();

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

