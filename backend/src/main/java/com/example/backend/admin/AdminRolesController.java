package com.example.backend.admin;

import com.example.backend.rbac.RoleRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/roles")
public class AdminRolesController {

  private final RoleRepository roleRepository;

  public AdminRolesController(RoleRepository roleRepository) {
    this.roleRepository = roleRepository;
  }

  @GetMapping
  public List<String> list() {
    return roleRepository.findAll().stream()
        .map(r -> r.getName())
        .sorted()
        .toList();
  }
}
