-- Flyway migration V2
-- RBAC: roles + user_roles
-- Target: MySQL 8+

CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(32) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_roles_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, role_id),
  KEY idx_user_roles_role (role_id),
  CONSTRAINT fk_user_roles_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role
    FOREIGN KEY (role_id) REFERENCES roles(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed roles (idempotent)
INSERT INTO roles(name) VALUES ('ADMIN')
  ON DUPLICATE KEY UPDATE name = VALUES(name);
INSERT INTO roles(name) VALUES ('USER')
  ON DUPLICATE KEY UPDATE name = VALUES(name);

