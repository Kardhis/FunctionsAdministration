package com.example.backend.debug;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** NDJSON append for debug sessions; also mirrors one WARN line for remote log capture. */
public final class AgentNdjsonLog {

  private static final Logger log = LoggerFactory.getLogger(AgentNdjsonLog.class);
  private static final String SESSION_ID = "82787c";
  private static final String LOG_FILE = "debug-82787c.log";

  private AgentNdjsonLog() {}

  public static void append82787c(
      String runId,
      String hypothesisId,
      String location,
      String message,
      String dataJsonObject) {
    try {
      String line =
          String.format(
              "{\"sessionId\":\"%s\",\"runId\":%s,\"hypothesisId\":%s,\"location\":%s,\"message\":%s,\"data\":%s,\"timestamp\":%d}%n",
              SESSION_ID,
              jsonStringOrNull(runId),
              jsonStringOrNull(hypothesisId),
              jsonStringOrNull(location),
              jsonStringOrNull(message),
              (dataJsonObject == null || dataJsonObject.isBlank()) ? "{}" : dataJsonObject,
              System.currentTimeMillis());
      Files.writeString(
          Path.of(LOG_FILE),
          line,
          StandardOpenOption.CREATE,
          StandardOpenOption.WRITE,
          StandardOpenOption.APPEND);
      log.warn("DEBUG_SESSION_{} {}", SESSION_ID, line.trim());
    } catch (Exception ignored) {
      // swallow
    }
  }

  public static String safe(String s) {
    return s == null ? "" : s;
  }

  public static String jsonEscape(String s) {
    if (s == null) return "";
    return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
  }

  public static String jsonStringOrNull(String s) {
    if (s == null) return "null";
    return "\"" + jsonEscape(s) + "\"";
  }
}
