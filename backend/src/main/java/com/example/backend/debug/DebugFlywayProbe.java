package com.example.backend.debug;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class DebugFlywayProbe implements ApplicationRunner {

  private final Environment env;
  private final DataSource dataSource;
  private final ObjectProvider<Flyway> flywayProvider;
  private final ApplicationContext appContext;

  public DebugFlywayProbe(Environment env, DataSource dataSource, ObjectProvider<Flyway> flywayProvider, ApplicationContext appContext) {
    this.env = env;
    this.dataSource = dataSource;
    this.flywayProvider = flywayProvider;
    this.appContext = appContext;
  }

  @Override
  public void run(ApplicationArguments args) {
    Map<String, Object> data = new HashMap<>();
    data.put("activeProfiles", env.getActiveProfiles());
    data.put("flywayEnabled", env.getProperty("spring.flyway.enabled"));
    data.put("flywayLocations", env.getProperty("spring.flyway.locations"));
    data.put("autoconfigureExclude", env.getProperty("spring.autoconfigure.exclude"));
    data.put("ddlAuto", env.getProperty("spring.jpa.hibernate.ddl-auto"));

    String url = env.getProperty("spring.datasource.url");
    if (url != null) {
      // avoid leaking credentials (shouldn't be in url, but sanitize anyway)
      data.put("datasourceUrl", url.replaceAll("(?i)password=[^&]*", "password=***"));
    }

    Flyway flyway = flywayProvider.getIfAvailable();
    data.put("flywayBeanPresent", flyway != null);
    try {
      Class.forName("org.flywaydb.core.Flyway");
      data.put("flywayClassPresent", true);
      Package p = Flyway.class.getPackage();
      if (p != null) data.put("flywayImplVersion", p.getImplementationVersion());
    } catch (Throwable t) {
      data.put("flywayClassPresent", false);
      data.put("flywayClassError", t.getClass().getName() + ":" + String.valueOf(t.getMessage()));
    }

    try {
      Class.forName("org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration");
      data.put("flywayAutoConfigClassPresent", true);
    } catch (Throwable t) {
      data.put("flywayAutoConfigClassPresent", false);
      data.put("flywayAutoConfigClassError", t.getClass().getName() + ":" + String.valueOf(t.getMessage()));
    }

    // Check for auto-config related beans without compile-time dependency on internal packages.
    try {
      Class<?> flywayPropsClz = Class.forName("org.springframework.boot.autoconfigure.flyway.FlywayProperties");
      data.put("flywayPropertiesBeanCount", appContext.getBeansOfType(flywayPropsClz).size());
    } catch (Throwable t) {
      data.put("flywayPropertiesBeanCount", -1);
      data.put("flywayPropertiesBeanError", t.getClass().getName() + ":" + String.valueOf(t.getMessage()));
    }

    try {
      Class<?> initClz = Class.forName("org.springframework.boot.autoconfigure.flyway.FlywayMigrationInitializer");
      data.put("flywayMigrationInitializerBeanCount", appContext.getBeansOfType(initClz).size());
    } catch (Throwable t) {
      data.put("flywayMigrationInitializerBeanCount", -1);
      data.put("flywayMigrationInitializerBeanError", t.getClass().getName() + ":" + String.valueOf(t.getMessage()));
    }

    try (Connection c = dataSource.getConnection();
        Statement st = c.createStatement()) {
      try (ResultSet rs = st.executeQuery("select database()")) {
        if (rs.next()) data.put("database", rs.getString(1));
      }
      try (ResultSet rs = st.executeQuery("select count(*) from information_schema.columns where table_schema = database() and table_name='objectives' and column_name in ('notes','start_date')")) {
        if (rs.next()) data.put("objectivesNotesStartDateColumnCount", rs.getLong(1));
      }
    } catch (Exception e) {
      data.put("dbProbeError", e.getClass().getName() + ":" + String.valueOf(e.getMessage()));
    }

    // Try to build a Flyway instance manually to capture missing DB support/module errors.
    try {
      String locs = env.getProperty("spring.flyway.locations");
      String[] locations = (locs == null || locs.isBlank()) ? new String[] {"classpath:db/migration"} : locs.split("\\s*,\\s*");
      Flyway manual = Flyway.configure().dataSource(dataSource).locations(locations).load();
      data.put("manualFlywayLoadOk", true);
      data.put("manualFlywayLocations", locations);
      try {
        data.put("manualFlywayCurrent", String.valueOf(manual.info().current()));
      } catch (Exception infoEx) {
        data.put("manualFlywayInfoError", infoEx.getClass().getName() + ":" + String.valueOf(infoEx.getMessage()));
      }
    } catch (Throwable t) {
      data.put("manualFlywayLoadOk", false);
      data.put("manualFlywayLoadError", t.getClass().getName() + ":" + String.valueOf(t.getMessage()));
    }

    appendNdjson("flyway probe", data);
  }

  private static void appendNdjson(String message, Map<String, Object> data) {
    try {
      String json = toJson(message, data);
      Files.writeString(Path.of("..", "debug-17183b.log"), json + "\n", StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    } catch (Exception ignored) {
      // ignore
    }
  }

  private static String toJson(String message, Map<String, Object> data) {
    StringBuilder sb = new StringBuilder();
    sb.append("{\"sessionId\":\"17183b\",\"runId\":\"pre-fix\",\"hypothesisId\":\"Hflyway\",\"location\":\"backend/debug/DebugFlywayProbe.java:run\"");
    sb.append(",\"message\":\"").append(escape(message)).append("\"");
    sb.append(",\"data\":{");
    boolean first = true;
    for (var e : data.entrySet()) {
      if (!first) sb.append(",");
      first = false;
      sb.append("\"").append(escape(e.getKey())).append("\":");
      Object v = e.getValue();
      if (v == null) sb.append("null");
      else if (v instanceof Number || v instanceof Boolean) sb.append(v.toString());
      else if (v instanceof String) sb.append("\"").append(escape((String) v)).append("\"");
      else if (v instanceof String[]) {
        sb.append("[");
        String[] arr = (String[]) v;
        for (int i = 0; i < arr.length; i++) {
          if (i > 0) sb.append(",");
          sb.append("\"").append(escape(arr[i])).append("\"");
        }
        sb.append("]");
      } else {
        sb.append("\"").append(escape(String.valueOf(v))).append("\"");
      }
    }
    sb.append("},\"timestamp\":").append(System.currentTimeMillis()).append("}");
    return sb.toString();
  }

  private static String escape(String s) {
    return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
  }
}

