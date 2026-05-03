package com.example.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

  @Value("${springdoc.api-docs.enabled:false}")
  private boolean apiDocsEnabled;

  @Bean
  SecurityFilterChain securityFilterChain(
      HttpSecurity http,
      JwtCookieAuthenticationFilter jwtCookieAuthenticationFilter,
      Environment env)
      throws Exception {
//    boolean apiDocsEnabled =
//       env.getProperty("springdoc.api-docs.enabled", Boolean.class, Boolean.TRUE);

    http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth -> {
              if (Boolean.TRUE.equals(apiDocsEnabled)) {
                auth.requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**")
                    .permitAll();
              }
              auth
                .requestMatchers("/health", "/actuator/health", "/actuator/info", "/error")
                  .permitAll()
                .requestMatchers("/login")
                  .permitAll()
                .requestMatchers("/auth/login", "/auth/logout")
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
