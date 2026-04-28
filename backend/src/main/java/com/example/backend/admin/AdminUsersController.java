package com.example.backend.admin;

import com.example.backend.rbac.Role;
import com.example.backend.rbac.RoleRepository;
import com.example.backend.rbac.UserRole;
import com.example.backend.rbac.UserRoleKey;
import com.example.backend.rbac.UserRoleRepository;
import com.example.backend.users.User;
import com.example.backend.users.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUsersController {

  public record AdminUserDto(
      Long id,
      String email,
      String displayName,
      boolean active,
      Instant createdAt,
      Instant updatedAt,
      List<String> roles) {}

  public record CreateUserRequest(
      String email, String password, String displayName, Boolean active, List<String> roles) {}

  public record UpdateUserRequest(String email, String displayName) {}

  public record UpdateStatusRequest(Boolean active) {}

  public record UpdateRolesRequest(List<String> roles) {}

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final UserRoleRepository userRoleRepository;
  private final PasswordEncoder passwordEncoder;

  public AdminUsersController(
      UserRepository userRepository,
      RoleRepository roleRepository,
      UserRoleRepository userRoleRepository,
      PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.userRoleRepository = userRoleRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @GetMapping
  public List<AdminUserDto> list() {
    return userRepository.findAll().stream()
        .map(
            u ->
                new AdminUserDto(
                    u.getId(),
                    u.getEmail(),
                    u.getDisplayName(),
                    u.isActive(),
                    u.getCreatedAt(),
                    u.getUpdatedAt(),
                    userRoleRepository.findRoleNamesByUserId(u.getId())))
        .toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public AdminUserDto create(@RequestBody CreateUserRequest req) {
    if (req == null || req.email() == null || req.email().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email_required");
    }
    if (req.password() == null || req.password().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password_required");
    }
    String email = req.email().trim().toLowerCase();
    if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "email_exists");
    }

    Instant now = Instant.now();
    User u = new User();
    u.setEmail(email);
    u.setPasswordHash(passwordEncoder.encode(req.password()));
    u.setDisplayName(req.displayName());
    u.setActive(req.active() == null ? true : req.active());
    u.setCreatedAt(now);
    u.setUpdatedAt(now);
    User saved = userRepository.save(u);

    List<String> roles = req.roles() == null || req.roles().isEmpty() ? List.of("USER") : req.roles();
    setRoles(saved, roles);

    return new AdminUserDto(
        saved.getId(),
        saved.getEmail(),
        saved.getDisplayName(),
        saved.isActive(),
        saved.getCreatedAt(),
        saved.getUpdatedAt(),
        userRoleRepository.findRoleNamesByUserId(saved.getId()));
  }

  @PutMapping("/{id}")
  public AdminUserDto updateBasics(@PathVariable("id") Long id, @RequestBody UpdateUserRequest req) {
    User u =
        userRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user_not_found"));
    if (req == null) req = new UpdateUserRequest(null, null);

    if (req.email() != null) {
      String nextEmail = req.email().trim().toLowerCase();
      if (!nextEmail.equalsIgnoreCase(u.getEmail())
          && userRepository.findByEmailIgnoreCase(nextEmail).isPresent()) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "email_exists");
      }
      u.setEmail(nextEmail);
    }
    if (req.displayName() != null) u.setDisplayName(req.displayName());
    u.setUpdatedAt(Instant.now());
    User saved = userRepository.save(u);
    return new AdminUserDto(
        saved.getId(),
        saved.getEmail(),
        saved.getDisplayName(),
        saved.isActive(),
        saved.getCreatedAt(),
        saved.getUpdatedAt(),
        userRoleRepository.findRoleNamesByUserId(saved.getId()));
  }

  @PutMapping("/{id}/status")
  public AdminUserDto updateStatus(
      @PathVariable("id") Long id, @RequestBody UpdateStatusRequest req) {
    if (req == null || req.active() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "active_required");
    }
    User u =
        userRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user_not_found"));
    u.setActive(req.active());
    u.setUpdatedAt(Instant.now());
    User saved = userRepository.save(u);
    return new AdminUserDto(
        saved.getId(),
        saved.getEmail(),
        saved.getDisplayName(),
        saved.isActive(),
        saved.getCreatedAt(),
        saved.getUpdatedAt(),
        userRoleRepository.findRoleNamesByUserId(saved.getId()));
  }

  @PutMapping("/{id}/roles")
  public AdminUserDto updateRoles(
      @PathVariable("id") Long id, @RequestBody UpdateRolesRequest req) {
    if (req == null || req.roles() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "roles_required");
    }
    User u =
        userRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user_not_found"));
    setRoles(u, req.roles());
    return new AdminUserDto(
        u.getId(),
        u.getEmail(),
        u.getDisplayName(),
        u.isActive(),
        u.getCreatedAt(),
        u.getUpdatedAt(),
        userRoleRepository.findRoleNamesByUserId(u.getId()));
  }

  private void setRoles(User user, List<String> roleNames) {
    Set<String> normalized =
        roleNames.stream()
            .filter(r -> r != null && !r.isBlank())
            .map(r -> r.trim().toUpperCase())
            .collect(java.util.stream.Collectors.toSet());
    if (normalized.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "at_least_one_role_required");
    }

    // validate roles exist
    List<Role> roles =
        normalized.stream()
            .map(
                name ->
                    roleRepository
                        .findByName(name)
                        .orElseThrow(
                            () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "role_invalid")))
            .toList();

    userRoleRepository.deleteAllByIdUserId(user.getId());
    for (Role r : roles) {
      UserRole ur = new UserRole();
      ur.setUser(user);
      ur.setRole(r);
      ur.setId(new UserRoleKey(user.getId(), r.getId()));
      userRoleRepository.save(ur);
    }
  }
}

