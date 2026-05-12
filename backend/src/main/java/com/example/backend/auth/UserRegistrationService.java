package com.example.backend.auth;

import com.example.backend.rbac.Role;
import com.example.backend.rbac.RoleRepository;
import com.example.backend.rbac.UserRole;
import com.example.backend.rbac.UserRoleKey;
import com.example.backend.rbac.UserRoleRepository;
import com.example.backend.users.User;
import com.example.backend.users.UserRepository;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserRegistrationService {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final UserRoleRepository userRoleRepository;
  private final PasswordEncoder passwordEncoder;

  public UserRegistrationService(
      UserRepository userRepository,
      RoleRepository roleRepository,
      UserRoleRepository userRoleRepository,
      PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.userRoleRepository = userRoleRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional
  public void register(RegisterRequest req) {
    String email = req.email().trim().toLowerCase();
    if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "email_exists");
    }

    Instant now = Instant.now();
    User u = new User();
    u.setEmail(email);
    u.setPasswordHash(passwordEncoder.encode(req.password()));
    u.setDisplayName(req.displayName() != null ? req.displayName().trim() : null);
    if (u.getDisplayName() != null && u.getDisplayName().isEmpty()) {
      u.setDisplayName(null);
    }
    u.setActive(true);
    u.setCreatedAt(now);
    u.setUpdatedAt(now);
    User saved = userRepository.save(u);

    Role userRole =
        roleRepository
            .findByName("USER")
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "role_user_missing"));

    UserRole ur = new UserRole();
    ur.setUser(saved);
    ur.setRole(userRole);
    ur.setId(new UserRoleKey(saved.getId(), userRole.getId()));
    userRoleRepository.save(ur);
  }
}
