package com.example.backend.debug;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

// #region agent log
/**
 * Logs CORS preflight requests (hypotheses C/D/E: OPTIONS handling, Origin mismatch, filters).
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsPreflightDebugFilter extends OncePerRequestFilter {

  private static final Logger slog = LoggerFactory.getLogger(CorsPreflightDebugFilter.class);

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String method = request.getMethod();
    String origin = request.getHeader("Origin");
    String uri = request.getRequestURI();
    if ("OPTIONS".equals(method)) {
      String data =
          "{\"method\":\"OPTIONS\",\"uri\":\""
              + DebugNdjson.esc(uri)
              + "\",\"originHeader\":\""
              + DebugNdjson.esc(origin == null ? "" : origin)
              + "\"}";
      DebugNdjson.append("C", "CorsPreflightDebugFilter.java:doFilterInternal", "preflight in", data);
      slog.warn("[debug-d26e7f hypothesis=C] OPTIONS in uri={} Origin={}", uri, origin);
    }
    filterChain.doFilter(request, response);
    if ("OPTIONS".equals(method)) {
      String acao = response.getHeader("Access-Control-Allow-Origin");
      String dataOut =
          "{\"uri\":\""
              + DebugNdjson.esc(uri)
              + "\",\"status\":"
              + response.getStatus()
              + ",\"accessControlAllowOrigin\":\""
              + DebugNdjson.esc(acao == null ? "" : acao)
              + "\"}";
      DebugNdjson.append(
          "D", "CorsPreflightDebugFilter.java:afterChain", "preflight out", dataOut);
      slog.warn(
          "[debug-d26e7f hypothesis=D] OPTIONS out uri={} status={} Access-Control-Allow-Origin={}",
          uri,
          response.getStatus(),
          acao);
    }
  }
}
// #endregion
