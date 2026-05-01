-- Objectives (goals) feature
-- MySQL 8+

CREATE TABLE IF NOT EXISTS objective_statuses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(32) NOT NULL,
  label VARCHAR(64) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_objective_statuses_code (code)
) ENGINE=InnoDB;

-- Seed statuses (idempotent)
INSERT INTO objective_statuses (code, label)
VALUES
  ('IN_PROGRESS', 'En progreso'),
  ('DONE', 'Realizado'),
  ('NOT_DONE', 'No realizado')
ON DUPLICATE KEY UPDATE label = VALUES(label);

CREATE TABLE IF NOT EXISTS objectives (
  id CHAR(36) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  habit_id CHAR(36) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL,
  end_date DATE NOT NULL,
  metric_type ENUM('REPETITIONS','MINUTES') NOT NULL,
  target_value INT NOT NULL,
  status_id BIGINT UNSIGNED NOT NULL,
  updated_at TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_objectives_user_status (user_id, status_id),
  KEY idx_objectives_user_habit (user_id, habit_id),
  KEY idx_objectives_user_end_date (user_id, end_date),
  CONSTRAINT fk_objectives_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_objectives_habit
    FOREIGN KEY (habit_id) REFERENCES habits(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_objectives_status
    FOREIGN KEY (status_id) REFERENCES objective_statuses(id)
    ON DELETE RESTRICT,
  CONSTRAINT ck_objectives_target_positive
    CHECK (target_value > 0)
) ENGINE=InnoDB;

