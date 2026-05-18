package com.example.backend.debug;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Temporary debug instrumentation for session 877f10. */
public final class DebugSessionLog {

  private static final Logger log = LoggerFactory.getLogger(DebugSessionLog.class);
  private static final String SESSION = "877f10";
  private static final String LOG_FILE = "debug-877f10.log";

  private DebugSessionLog() {}

  public static void write(
      String hypothesisId, String location, String message, String dataJson) {
    long ts = System.currentTimeMillis();
    String line =
        "{\"sessionId\":\""
            + SESSION
            + "\",\"hypothesisId\":\""
            + escape(hypothesisId)
            + "\",\"location\":\""
            + escape(location)
            + "\",\"message\":\""
            + escape(message)
            + "\",\"data\":"
            + (dataJson == null || dataJson.isBlank() ? "{}" : dataJson)
            + ",\"timestamp\":"
            + ts
            + "}\n";
    log.info("[DEBUG-877f10] {}", line.trim());
    try (var w = new java.io.FileWriter(LOG_FILE, true)) {
      w.write(line);
    } catch (Exception ignored) {
      // docker / read-only FS: SLF4J line above is enough
    }
  }

  private static String escape(String s) {
    if (s == null) return "";
    return s.replace("\\", "\\\\").replace("\"", "\\\"");
  }
}
