package com.example.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

  @Bean
  ObjectMapper objectMapper() {
    // #region agent log
    try {
      String line =
          "{\"sessionId\":\"17183b\",\"runId\":\"pre-fix\",\"hypothesisId\":\"H1\",\"location\":\"backend/config/JacksonConfig.java:16\",\"message\":\"ObjectMapper bean created\",\"data\":{},\"timestamp\":"
              + System.currentTimeMillis()
              + "}\n";
      Files.writeString(
          Path.of("debug-17183b.log"),
          line,
          StandardOpenOption.CREATE,
          StandardOpenOption.APPEND);
    } catch (Exception ignored) {
      // ignore
    }
    // #endregion agent log
    return new ObjectMapper();
  }
}

