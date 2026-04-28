package com.example.backend.habits;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSettingRepository extends JpaRepository<UserSetting, UserSettingKey> {
  Optional<UserSetting> findByIdUserIdAndIdSettingKey(Long userId, String settingKey);
}

