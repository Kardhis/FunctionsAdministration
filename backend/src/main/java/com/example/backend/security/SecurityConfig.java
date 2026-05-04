package com.example.backend.security;

import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

  private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

//  @Value("${springdoc.api-docs.enabled:false}")
//  private boolean apiDocsEnabled;

  @Bean
  public CorsConfigurationSource corsConfigurationSource(
      @Value("${app.cors.allowed-origins:http://localhost:5173}") String allowedOriginsRaw) {
    CorsConfiguration config = new CorsConfiguration();

    List<String> origins =
        Arrays.stream(allowedOriginsRaw.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toList();
    if (origins.isEmpty()) {
      origins = List.of("http://localhost:5173");
    }
    config.setAllowedOrigins(origins);

    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);

    log.info(
        "CORS enabled (SecurityConfig CorsConfigurationSource). allowedOrigins={}",
        config.getAllowedOrigins());

    return source;
  }

  @Bean
  SecurityFilterChain securityFilterChain(
      HttpSecurity http,
      JwtCookieAuthenticationFilter jwtCookieAuthenticationFilter,
      Environment env,
      CorsConfigurationSource corsConfigurationSource)
      throws Exception {
    boolean apiDocsEnabled =
       env.getProperty("springdoc.api-docs.enabled", Boolean.class, Boolean.TRUE);

    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource))
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth -> {
              if (Boolean.TRUE.equals(apiDocsEnabled)) {
                auth.requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**")
                    .permitAll();
              }
              auth
                .requestMatchers(HttpMethod.OPTIONS, "/**")
                  .permitAll()
                .requestMatchers("/health", "/actuator/health", "/actuator/info", "/error")
                  .permitAll()
                .requestMatchers("/login")
                  .permitAll()
                .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/login/", "/auth/logout", "/auth/logout/")
                  .permitAll()
                .requestMatchers("/auth/me")
                  .authenticated()
                .requestMatchers("/api/admin/**")
                  .hasRole("ADMIN")
                .requestMatchers("/api/**")
                  .hasAnyRole("ADMIN", "USER")
                .anyRequest()
                  .authenticated();
            })
        .exceptionHandling(
            eh ->
                eh.authenticationEntryPoint(
                    (req, res, ex) -> res.sendError(401, "Unauthorized")));
    http.addFilterBefore(
        jwtCookieAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }
}
