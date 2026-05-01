-- MySQL 8+
-- DBeaver bootstrap script (safe to re-run)
-- Schema: functions_administration

CREATE DATABASE IF NOT EXISTS functions_administration
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE functions_administration;

-- =====================
-- 1) Auth / users
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(320) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(120) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB;

-- =====================
-- 2) Habits
-- =====================
CREATE TABLE IF NOT EXISTS habits (
  id CHAR(36) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(80) NOT NULL,
  description VARCHAR(500) NULL,
  color CHAR(7) NOT NULL,
  icon VARCHAR(32) NULL,
  category ENUM('salud','estudio','trabajo','ejercicio','ocio','otro') NULL,
  active TINYINT(1) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL,
  updated_at TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_habits_user (user_id),
  KEY idx_habits_user_active (user_id, active),
  CONSTRAINT fk_habits_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================
-- 3) Habit entries (logs)
-- =====================
CREATE TABLE IF NOT EXISTS habit_entries (
  id CHAR(36) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  habit_id CHAR(36) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP(6) NOT NULL,
  updated_at TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_entries_user_date (user_id, date),
  KEY idx_entries_habit (habit_id),
  KEY idx_entries_habit_date (habit_id, date),
  CONSTRAINT fk_entries_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_entries_habit
    FOREIGN KEY (habit_id) REFERENCES habits(id)
    ON DELETE CASCADE,
  CONSTRAINT ck_entries_nonnegative_duration
    CHECK (duration_minutes >= 0),
  CONSTRAINT ck_entries_end_after_start
    CHECK (end_time >= start_time)
) ENGINE=InnoDB;

-- =====================
-- 4) User settings (key/value JSON)
-- =====================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id BIGINT UNSIGNED NOT NULL,
  setting_key VARCHAR(64) NOT NULL,
  setting_value JSON NOT NULL,
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id, setting_key),
  CONSTRAINT fk_settings_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================
-- 5) Reminders
-- =====================
CREATE TABLE IF NOT EXISTS reminders (
  id CHAR(36) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  habit_id CHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  schedule JSON NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_reminders_user (user_id),
  KEY idx_reminders_user_enabled (user_id, enabled),
  KEY idx_reminders_habit (habit_id),
  CONSTRAINT fk_reminders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reminders_habit
    FOREIGN KEY (habit_id) REFERENCES habits(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

