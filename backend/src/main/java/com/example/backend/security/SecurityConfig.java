package com.example.backend.security;

import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

//  @Value("${springdoc.api-docs.enabled:false}")
//  private boolean apiDocsEnabled;

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();

    config.setAllowedOrigins(
        List.of(
            "http://168.231.84.188",
            "https://168.231.84.188"));

    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }

  @Bean
  SecurityFilterChain securityFilterChain(
      HttpSecurity http,
      JwtCookieAuthenticationFilter jwtCookieAuthenticationFilter,
      Environment env)
      throws Exception {
    boolean apiDocsEnabled =
       env.getProperty("springdoc.api-docs.enabled", Boolean.class, Boolean.TRUE);

    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
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
