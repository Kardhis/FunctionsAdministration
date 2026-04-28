package com.example.backend.security;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.example.backend.auth.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
    if (SecurityContextHolder.getContext().getAuthentication() == null) {
      String token = readCookie(request, cookieName);
      if (token != null && !token.isBlank()) {
        try {
          String subject = jwtService.verifyAndGetSubject(token);
          List<String> roles = jwtService.verifyAndGetRoles(token);
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
          SecurityContextHolder.clearContext();
        }
      }
    }

    filterChain.doFilter(request, response);
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

