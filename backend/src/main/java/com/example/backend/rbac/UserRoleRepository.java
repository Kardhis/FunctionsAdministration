package com.example.backend.rbac;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleKey> {
  List<UserRole> findAllByIdUserId(Long userId);

  void deleteAllByIdUserId(Long userId);

  @Query("select ur.role.name from UserRole ur where ur.user.id = :userId")
  List<String> findRoleNamesByUserId(@Param("userId") Long userId);
}

