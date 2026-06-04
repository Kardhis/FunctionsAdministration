-- Tasks module
-- MySQL 8+ / InnoDB
-- bb-dd-agent reviewed: BIGINT PKs, FK task_status_id → task_statuses, FKs indexed, constraints

-- =====================
-- 1. Task statuses (lookup)
-- =====================
CREATE TABLE IF NOT EXISTS task_statuses (
  id    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code  VARCHAR(32)     NOT NULL,
  label VARCHAR(64)     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_task_statuses_code (code)
) ENGINE=InnoDB;

INSERT INTO task_statuses (code, label) VALUES
  ('BACKLOG',     'Backlog'),
  ('PENDIENTE',   'Pendent'),
  ('PLANIFICADA', 'Planificada'),
  ('EN_PROGRESO', 'En progrés'),
  ('BLOQUEADA',   'Blocada'),
  ('COMPLETADA',  'Completada'),
  ('CANCELADA',   'Cancel·lada')
ON DUPLICATE KEY UPDATE label = VALUES(label);

-- =====================
-- 2. Task categories (per user)
-- =====================
CREATE TABLE IF NOT EXISTS task_categories (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  name       VARCHAR(80)     NOT NULL,
  color      CHAR(7)         NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_task_categories_user (user_id),
  CONSTRAINT fk_task_categories_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================
-- 3. Task projects (per user)
-- =====================
CREATE TABLE IF NOT EXISTS task_projects (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  name       VARCHAR(80)     NOT NULL,
  color      CHAR(7)         NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_task_projects_user (user_id),
  CONSTRAINT fk_task_projects_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================
-- 4. Tasks (main table)
-- =====================
CREATE TABLE IF NOT EXISTS tasks (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id             BIGINT UNSIGNED NOT NULL,
  task_status_id      BIGINT UNSIGNED NOT NULL,
  title               VARCHAR(160)    NOT NULL,
  description         TEXT            NULL,
  due_date            DATE            NULL,
  planned_date        DATE            NULL,
  planned_time        TIME            NULL,
  important           TINYINT(1)      NULL,
  urgent              TINYINT(1)      NULL,
  project_id          BIGINT UNSIGNED NULL,
  category_id         BIGINT UNSIGNED NULL,
  is_recurring        TINYINT(1)      NOT NULL DEFAULT 0,
  recurrence_type     VARCHAR(32)     NULL,
  recurrence_interval INT UNSIGNED    NULL,
  recurrence_end_date DATE            NULL,
  estimated_minutes   INT UNSIGNED    NULL,
  total_minutes       INT UNSIGNED    NULL,
  completed_at        TIMESTAMP(6)    NULL,
  deleted_at          TIMESTAMP(6)    NULL,
  created_at          TIMESTAMP(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at          TIMESTAMP(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

  PRIMARY KEY (id),

  -- Query: listado general filtrat per estat
  KEY idx_tasks_user_status     (user_id, deleted_at, task_status_id),
  -- Query: calendari i avui (ordre per data + hora)
  KEY idx_tasks_user_planned    (user_id, deleted_at, planned_date, planned_time, id),
  -- Query: tasques vencudes
  KEY idx_tasks_user_due        (user_id, deleted_at, due_date, id),
  -- Query: Eisenhower quadrants
  KEY idx_tasks_user_eisenhower (user_id, deleted_at, important, urgent, id),
  -- Query: backlog (sense data planificada)
  KEY idx_tasks_user_backlog    (user_id, planned_date, deleted_at, id),
  -- Query: recurrents
  KEY idx_tasks_user_recurring  (user_id, deleted_at, is_recurring, recurrence_end_date),
  -- Query: filtre per projecte i categoria
  KEY idx_tasks_user_project    (user_id, project_id),
  KEY idx_tasks_user_category   (user_id, category_id),
  -- Query: búsqueda per títol
  KEY idx_tasks_user_title      (user_id, title),

  CONSTRAINT fk_tasks_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_tasks_status
    FOREIGN KEY (task_status_id) REFERENCES task_statuses(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_tasks_project
    FOREIGN KEY (project_id) REFERENCES task_projects(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_tasks_category
    FOREIGN KEY (category_id) REFERENCES task_categories(id)
    ON DELETE SET NULL,

  CONSTRAINT ck_tasks_recurrence_interval
    CHECK (recurrence_interval IS NULL OR recurrence_interval > 0),
  CONSTRAINT ck_tasks_estimated_minutes
    CHECK (estimated_minutes IS NULL OR estimated_minutes > 0),
  CONSTRAINT ck_tasks_recurrence_type
    CHECK (recurrence_type IS NULL OR recurrence_type IN ('DAILY','WEEKLY','MONTHLY','CUSTOM'))
) ENGINE=InnoDB;

-- =====================
-- 5. Task recurrence exceptions
-- =====================
CREATE TABLE IF NOT EXISTS task_recurrence_exceptions (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  task_id               BIGINT UNSIGNED NOT NULL,
  occurrence_date       DATE            NOT NULL,
  action                VARCHAR(32)     NOT NULL,
  planned_date_override DATE            NULL,
  planned_time_override TIME            NULL,
  completed_at          TIMESTAMP(6)    NULL,
  notes                 TEXT            NULL,
  created_at            TIMESTAMP(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at            TIMESTAMP(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

  PRIMARY KEY (id),
  UNIQUE KEY uk_task_recurrence_exception  (task_id, occurrence_date),
  KEY idx_task_recurrence_exception_task   (task_id),
  KEY idx_task_recurrence_exception_date   (task_id, occurrence_date),

  CONSTRAINT fk_task_recurrence_exception_task
    FOREIGN KEY (task_id) REFERENCES tasks(id)
    ON DELETE CASCADE,
  CONSTRAINT ck_task_recurrence_exception_action
    CHECK (action IN ('COMPLETED','SKIPPED','RESCHEDULED','CANCELLED'))
) ENGINE=InnoDB;
