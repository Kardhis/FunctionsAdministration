package com.example.backend.users;

import java.time.Instant;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.example.backend.rbac.RoleRepository;
import com.example.backend.rbac.Role;
import com.example.backend.rbac.UserRole;
import com.example.backend.rbac.UserRoleKey;
import com.example.backend.rbac.UserRoleRepository;

@Component
public class DemoUserSeeder implements CommandLineRunner {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final RoleRepository roleRepository;
  private final UserRoleRepository userRoleRepository;
  private final boolean enabled;

  public DemoUserSeeder(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      RoleRepository roleRepository,
      UserRoleRepository userRoleRepository,
      @Value("${app.demo.seed-user:true}") boolean enabled) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.roleRepository = roleRepository;
    this.userRoleRepository = userRoleRepository;
    this.enabled = enabled;
  }

  @Override
  public void run(String... args) {
    if (!enabled) return;

    String email = "adminuser@mail.com";
    boolean exists = userRepository.findByEmailIgnoreCase(email).isPresent();
    if (exists) return;

    Instant now = Instant.now();
    User u = new User();
    u.setEmail(email);
    u.setDisplayName("Demo");
    u.setPasswordHash(passwordEncoder.encode("password"));
    u.setActive(true);
    u.setCreatedAt(now);
    u.setUpdatedAt(now);
    User saved = userRepository.save(u);

    // Ensure demo user can access admin UI in MVP
    Role adminRole = roleRepository.findByName("ADMIN").orElse(null);
    if (adminRole != null) {
      UserRole ur = new UserRole();
      ur.setUser(saved);
      ur.setRole(adminRole);
      ur.setId(new UserRoleKey(saved.getId(), adminRole.getId()));
      userRoleRepository.save(ur);
    }

    Role userRole = roleRepository.findByName("USER").orElse(null);
    if (userRole != null) {
      UserRole ur = new UserRole();
      ur.setUser(saved);
      ur.setRole(userRole);
      ur.setId(new UserRoleKey(saved.getId(), userRole.getId()));
      userRoleRepository.save(ur);
    }
  }
}

