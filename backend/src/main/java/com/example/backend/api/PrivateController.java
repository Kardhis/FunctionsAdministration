package com.example.backend.api;

import java.security.Principal;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PrivateController {

  @GetMapping("/private")
  public Map<String, String> getPrivateData(Principal principal) {
    return Map.of("message", "private_data", "user", principal.getName());
  }
}

