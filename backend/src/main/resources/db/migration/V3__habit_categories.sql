-- Flyway migration V3
-- Habit categories (per user) + many-to-many links to habits
-- Also migrates legacy habits.category (ENUM) into the new tables and drops the column.
-- Target: MySQL 8+

-- =====================
-- 1) New tables
-- =====================
CREATE TABLE IF NOT EXISTS habit_categories (
  id CHAR(36) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(80) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP(6) NOT NULL,
  updated_at TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_habit_categories_user_name (user_id, name),
  KEY idx_habit_categories_user (user_id),
  CONSTRAINT fk_habit_categories_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS habit_category_links (
  habit_id CHAR(36) NOT NULL,
  category_id CHAR(36) NOT NULL,
  PRIMARY KEY (habit_id, category_id),
  KEY idx_habit_category_links_category (category_id),
  KEY idx_habit_category_links_habit (habit_id),
  CONSTRAINT fk_habit_category_links_habit
    FOREIGN KEY (habit_id) REFERENCES habits(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_habit_category_links_category
    FOREIGN KEY (category_id) REFERENCES habit_categories(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================
-- 2) Migrate legacy habits.category -> habit_categories + links
-- =====================
-- Create a deterministic mapping table so we can reuse UUIDs across inserts.
CREATE TABLE IF NOT EXISTS _habit_category_legacy_map (
  user_id BIGINT UNSIGNED NOT NULL,
  legacy_key VARCHAR(80) NOT NULL,
  category_id CHAR(36) NOT NULL,
  PRIMARY KEY (user_id, legacy_key),
  UNIQUE KEY uk_legacy_map_category_id (category_id)
) ENGINE=InnoDB;

-- Populate map from existing habits.category values.
-- If the column doesn't exist, this statement will fail; V1 creates it, and we drop it later in this migration.
INSERT IGNORE INTO _habit_category_legacy_map(user_id, legacy_key, category_id)
SELECT DISTINCT
  user_id,
  CAST(category AS CHAR(80)) AS legacy_key,
  UUID() AS category_id
FROM habits
WHERE category IS NOT NULL;

-- Insert categories from map (idempotent).
INSERT IGNORE INTO habit_categories(id, user_id, name, active, created_at, updated_at)
SELECT
  m.category_id,
  m.user_id,
  CASE m.legacy_key
    WHEN 'salud' THEN 'Salud'
    WHEN 'estudio' THEN 'Estudio'
    WHEN 'trabajo' THEN 'Trabajo'
    WHEN 'ejercicio' THEN 'Físico'
    WHEN 'ocio' THEN 'Ocio'
    WHEN 'otro' THEN 'Otro'
    ELSE CONCAT(UCASE(LEFT(m.legacy_key, 1)), SUBSTRING(m.legacy_key, 2))
  END AS name,
  1 AS active,
  NOW(6) AS created_at,
  NOW(6) AS updated_at
FROM _habit_category_legacy_map m;

-- Create links habit -> category
INSERT IGNORE INTO habit_category_links(habit_id, category_id)
SELECT
  h.id AS habit_id,
  m.category_id AS category_id
FROM habits h
JOIN _habit_category_legacy_map m
  ON m.user_id = h.user_id AND m.legacy_key = CAST(h.category AS CHAR(80))
WHERE h.category IS NOT NULL;

-- =====================
-- 3) Drop legacy column habits.category
-- =====================
ALTER TABLE habits DROP COLUMN category;

-- Cleanup helper table
DROP TABLE IF EXISTS _habit_category_legacy_map;

