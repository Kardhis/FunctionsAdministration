package com.example.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(
      HttpSecurity http, JwtCookieAuthenticationFilter jwtCookieAuthenticationFilter)
      throws Exception {
    return http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth
                    .requestMatchers("/health", "/actuator/health")
                        .permitAll()
                    .requestMatchers("/auth/login", "/auth/logout")
                        .permitAll()
                    .requestMatchers("/auth/me", "/api/**")
                        .authenticated()
                    .anyRequest()
                        .permitAll())
        .exceptionHandling(
            eh ->
                eh.authenticationEntryPoint(
                    (req, res, ex) -> res.sendError(401, "Unauthorized")))
        .addFilterBefore(jwtCookieAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }
}

