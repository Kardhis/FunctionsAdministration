package com.example.backend.debug;

import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

// #region agent log
/**
 * Logs effective CORS config at startup (hypotheses A/B: wrong profile or env overrides).
 */
@Component
@Order(0)
public class CorsStartupDebugLogger implements ApplicationRunner {

  private static final Logger slog = LoggerFactory.getLogger(CorsStartupDebugLogger.class);

  private final Environment env;

  public CorsStartupDebugLogger(Environment env) {
    this.env = env;
  }

  @Override
  public void run(ApplicationArguments args) {
    String profiles = String.join(",", env.getActiveProfiles());
    if (profiles.isEmpty()) {
      profiles = "(default)";
    }
    String raw = env.getProperty("app.cors.allowed-origins", "");
    String joined =
        String.join(
            "|",
            Arrays.stream(raw.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList());
    String data =
        "{\"activeProfiles\":\""
            + DebugNdjson.esc(profiles)
            + "\",\"allowedOriginsRaw\":\""
            + DebugNdjson.esc(raw)
            + "\",\"parsedOriginsJoined\":\""
            + DebugNdjson.esc(joined)
            + "\"}";
    DebugNdjson.append("A", "CorsStartupDebugLogger.java:run", "startup cors env", data);
    slog.warn(
        "[debug-d26e7f hypothesis=A] activeProfiles={} allowedOriginsRaw={} parsedOriginsJoined={}",
        profiles,
        raw,
        joined);
  }
}
// #endregion
