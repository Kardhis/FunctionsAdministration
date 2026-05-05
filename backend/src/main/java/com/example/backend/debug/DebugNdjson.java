package com.example.backend.debug;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Locale;

/** Session debug NDJSON (workspace root: debug-d26e7f.log). */
public final class DebugNdjson {

  private static final String SESSION = "d26e7f";

  private DebugNdjson() {}

  private static Path resolvePath() {
    Path cwd = Paths.get(System.getProperty("user.dir", ".")).toAbsolutePath().normalize();
    if (cwd.endsWith("backend")) {
      return cwd.getParent().resolve("debug-d26e7f.log");
    }
    return cwd.resolve("debug-d26e7f.log");
  }

  public static void append(
      String hypothesisId, String location, String message, String dataJsonObject) {
    try {
      long ts = System.currentTimeMillis();
      String line =
          String.format(
              Locale.US,
              "{\"sessionId\":\"%s\",\"hypothesisId\":\"%s\",\"location\":\"%s\",\"message\":\"%s\",\"data\":%s,\"timestamp\":%d}\n",
              SESSION,
              jsonEscape(hypothesisId),
              jsonEscape(location),
              jsonEscape(message),
              dataJsonObject == null || dataJsonObject.isBlank() ? "{}" : dataJsonObject,
              ts);
      Files.writeString(
          resolvePath(),
          line,
          StandardCharsets.UTF_8,
          StandardOpenOption.CREATE,
          StandardOpenOption.APPEND);
    } catch (Exception ignored) {
      // debug-only
    }
  }

  /** Escape for JSON string values inside {@code append} data objects. */
  public static String esc(String s) {
    if (s == null) return "";
    return s.replace("\\", "\\\\")
        .replace("\"", "\\\"")
        .replace("\n", "\\n")
        .replace("\r", "\\r");
  }

  private static String jsonEscape(String s) {
    return esc(s);
  }
}
