package com.example.backend.security;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.example.backend.auth.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtCookieAuthenticationFilter extends OncePerRequestFilter {

  private final JwtService jwtService;
  private final String cookieName;

  public JwtCookieAuthenticationFilter(
      JwtService jwtService, @Value("${app.auth.cookie-name}") String cookieName) {
    this.jwtService = jwtService;
    this.cookieName = cookieName;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    // #region agent log
    agentLog(
        "pre-fix",
        "H1",
        "JwtCookieAuthenticationFilter.java:doFilterInternal:entry",
        "Request entry",
        String.format(
            "{\"method\":\"%s\",\"uri\":\"%s\",\"origin\":%s,\"host\":%s,\"scheme\":\"%s\",\"isSecure\":%s,\"cookieName\":\"%s\",\"hasCookies\":%s,\"cookieNames\":%s,\"hasAuthAlready\":%s}",
            safe(request.getMethod()),
            safe(request.getRequestURI()),
            jsonStringOrNull(request.getHeader("Origin")),
            jsonStringOrNull(request.getHeader("Host")),
            safe(request.getScheme()),
            request.isSecure(),
            safe(cookieName),
            request.getCookies() != null,
            jsonStringArray(getCookieNames(request.getCookies())),
            SecurityContextHolder.getContext().getAuthentication() != null));
    // #endregion agent log

    if (SecurityContextHolder.getContext().getAuthentication() == null) {
      String token = readCookie(request, cookieName);
      // #region agent log
      agentLog(
          "pre-fix",
          "H2",
          "JwtCookieAuthenticationFilter.java:doFilterInternal:cookie",
          "Cookie read result",
          String.format(
              "{\"cookieName\":\"%s\",\"tokenPresent\":%s,\"tokenLength\":%d}",
              safe(cookieName),
              token != null && !token.isBlank(),
              token == null ? 0 : token.length()));
      // #endregion agent log
      if (token != null && !token.isBlank()) {
        try {
          String subject = jwtService.verifyAndGetSubject(token);
          List<String> roles = jwtService.verifyAndGetRoles(token);
          // #region agent log
          agentLog(
              "pre-fix",
              "H4",
              "JwtCookieAuthenticationFilter.java:doFilterInternal:verified",
              "JWT verified",
              String.format(
                  "{\"subject\":%s,\"rolesCount\":%d}",
                  jsonStringOrNull(subject),
                  roles == null ? 0 : roles.size()));
          // #endregion agent log
          var authorities =
              roles.stream()
                  .filter(r -> r != null && !r.isBlank())
                  .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                  .toList();
          var auth =
              new UsernamePasswordAuthenticationToken(subject, null, authorities);
          auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (JWTVerificationException ex) {
          // #region agent log
          agentLog(
              "pre-fix",
              "H4",
              "JwtCookieAuthenticationFilter.java:doFilterInternal:verify_failed",
              "JWT verification failed",
              String.format(
                  "{\"exception\":%s,\"message\":%s}",
                  jsonStringOrNull(ex.getClass().getName()),
                  jsonStringOrNull(ex.getMessage())));
          // #endregion agent log
          SecurityContextHolder.clearContext();
        }
      }
    }

    filterChain.doFilter(request, response);
  }

  private static void agentLog(
      String runId, String hypothesisId, String location, String message, String dataJsonObject) {
    try {
      String line =
          String.format(
              "{\"sessionId\":\"16e790\",\"runId\":%s,\"hypothesisId\":%s,\"location\":%s,\"message\":%s,\"data\":%s,\"timestamp\":%d}%n",
              jsonStringOrNull(runId),
              jsonStringOrNull(hypothesisId),
              jsonStringOrNull(location),
              jsonStringOrNull(message),
              (dataJsonObject == null || dataJsonObject.isBlank()) ? "{}" : dataJsonObject,
              System.currentTimeMillis());
      Files.writeString(
          Path.of("debug-16e790.log"),
          line,
          StandardOpenOption.CREATE,
          StandardOpenOption.WRITE,
          StandardOpenOption.APPEND);
    } catch (Exception ignored) {
      // swallow
    }
  }

  private static String safe(String s) {
    return s == null ? "" : s;
  }

  private static String jsonEscape(String s) {
    if (s == null) return "";
    return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
  }

  private static String jsonStringOrNull(String s) {
    if (s == null) return "null";
    return "\"" + jsonEscape(s) + "\"";
  }

  private static String[] getCookieNames(Cookie[] cookies) {
    if (cookies == null) return new String[0];
    return Arrays.stream(cookies).map(Cookie::getName).toArray(String[]::new);
  }

  private static String jsonStringArray(String[] arr) {
    if (arr == null) return "[]";
    StringBuilder sb = new StringBuilder();
    sb.append("[");
    for (int i = 0; i < arr.length; i++) {
      if (i > 0) sb.append(",");
      sb.append(jsonStringOrNull(arr[i]));
    }
    sb.append("]");
    return sb.toString();
  }

  private static String readCookie(HttpServletRequest request, String name) {
    Cookie[] cookies = request.getCookies();
    if (cookies == null) return null;
    return Arrays.stream(cookies)
        .filter(c -> name.equals(c.getName()))
        .map(Cookie::getValue)
        .findFirst()
        .orElse(null);
  }
}

