package com.example.backend.security;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.example.backend.auth.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import com.example.backend.debug.AgentNdjsonLog;
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
    AgentNdjsonLog.append82787c(
        "pre-fix",
        "H1",
        "JwtCookieAuthenticationFilter.java:doFilterInternal:entry",
        "Request entry",
        String.format(
            "{\"method\":\"%s\",\"uri\":\"%s\",\"servletPath\":\"%s\",\"contextPath\":\"%s\",\"origin\":%s,\"host\":%s,\"scheme\":\"%s\",\"isSecure\":%s,\"cookieName\":\"%s\",\"hasCookies\":%s,\"cookieNames\":%s,\"hasAuthAlready\":%s}",
            AgentNdjsonLog.safe(request.getMethod()),
            AgentNdjsonLog.safe(request.getRequestURI()),
            AgentNdjsonLog.safe(request.getServletPath()),
            AgentNdjsonLog.safe(request.getContextPath()),
            AgentNdjsonLog.jsonStringOrNull(request.getHeader("Origin")),
            AgentNdjsonLog.jsonStringOrNull(request.getHeader("Host")),
            AgentNdjsonLog.safe(request.getScheme()),
            request.isSecure(),
            AgentNdjsonLog.safe(cookieName),
            request.getCookies() != null,
            jsonStringArray(getCookieNames(request.getCookies())),
            SecurityContextHolder.getContext().getAuthentication() != null));
    // #endregion agent log

    if (SecurityContextHolder.getContext().getAuthentication() == null) {
      String token = readCookie(request, cookieName);
      // #region agent log
      AgentNdjsonLog.append82787c(
          "pre-fix",
          "H2",
          "JwtCookieAuthenticationFilter.java:doFilterInternal:cookie",
          "Cookie read result",
          String.format(
              "{\"cookieName\":\"%s\",\"tokenPresent\":%s,\"tokenLength\":%d}",
              AgentNdjsonLog.safe(cookieName),
              token != null && !token.isBlank(),
              token == null ? 0 : token.length()));
      // #endregion agent log
      if (token != null && !token.isBlank()) {
        try {
          String subject = jwtService.verifyAndGetSubject(token);
          List<String> roles = jwtService.verifyAndGetRoles(token);
          // #region agent log
          AgentNdjsonLog.append82787c(
              "pre-fix",
              "H4",
              "JwtCookieAuthenticationFilter.java:doFilterInternal:verified",
              "JWT verified",
              String.format(
                  "{\"subject\":%s,\"rolesCount\":%d}",
                  AgentNdjsonLog.jsonStringOrNull(subject),
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
          AgentNdjsonLog.append82787c(
              "pre-fix",
              "H4",
              "JwtCookieAuthenticationFilter.java:doFilterInternal:verify_failed",
              "JWT verification failed",
              String.format(
                  "{\"exception\":%s,\"message\":%s}",
                  AgentNdjsonLog.jsonStringOrNull(ex.getClass().getName()),
                  AgentNdjsonLog.jsonStringOrNull(ex.getMessage())));
          // #endregion agent log
          SecurityContextHolder.clearContext();
        }
      }
    }

    filterChain.doFilter(request, response);
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
      sb.append(AgentNdjsonLog.jsonStringOrNull(arr[i]));
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

