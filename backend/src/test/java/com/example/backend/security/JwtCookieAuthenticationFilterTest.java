package com.example.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.example.backend.auth.JwtService;
import com.example.backend.rbac.UserRoleRepository;
import com.example.backend.users.User;
import com.example.backend.users.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class JwtCookieAuthenticationFilterTest {

  private static final String COOKIE_NAME = "access_token";

  @Mock JwtService jwtService;
  @Mock UserRepository userRepository;
  @Mock UserRoleRepository userRoleRepository;
  @Mock FilterChain filterChain;

  JwtCookieAuthenticationFilter filter;

  @BeforeEach
  void setUp() {
    filter =
        new JwtCookieAuthenticationFilter(
            jwtService, userRepository, userRoleRepository, COOKIE_NAME);
    SecurityContextHolder.clearContext();
  }

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void setsAuthenticationWhenCookieIsValid() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setCookies(new Cookie(COOKIE_NAME, "valid-jwt"));
    MockHttpServletResponse response = new MockHttpServletResponse();

    when(jwtService.verifyAndGetSubject("valid-jwt")).thenReturn("user@example.com");
    when(jwtService.verifyAndGetRoles("valid-jwt")).thenReturn(List.of("USER"));
    when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.empty());

    filter.doFilterInternal(request, response, filterChain);

    var auth = SecurityContextHolder.getContext().getAuthentication();
    assertThat(auth).isNotNull();
    assertThat(auth.getName()).isEqualTo("user@example.com");
    assertThat(auth.getAuthorities())
        .extracting(a -> a.getAuthority())
        .containsExactly("ROLE_USER");
    verify(filterChain).doFilter(request, response);
  }

  @Test
  void prefersDatabaseRolesWhenPresent() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setCookies(new Cookie(COOKIE_NAME, "admin-jwt"));
    MockHttpServletResponse response = new MockHttpServletResponse();

    User user = mock(User.class);
    when(user.getId()).thenReturn(7L);
    when(jwtService.verifyAndGetSubject("admin-jwt")).thenReturn("admin@example.com");
    when(jwtService.verifyAndGetRoles("admin-jwt")).thenReturn(List.of("USER"));
    when(userRepository.findByEmailIgnoreCase("admin@example.com")).thenReturn(Optional.of(user));
    when(userRoleRepository.findRoleNamesByUserId(7L)).thenReturn(List.of("ADMIN"));

    filter.doFilterInternal(request, response, filterChain);

    var auth = SecurityContextHolder.getContext().getAuthentication();
    assertThat(auth.getAuthorities())
        .extracting(a -> a.getAuthority())
        .containsExactly("ROLE_ADMIN");
    verify(filterChain).doFilter(request, response);
  }

  @Test
  void clearsContextWhenTokenIsInvalid() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setCookies(new Cookie(COOKIE_NAME, "bad-jwt"));
    MockHttpServletResponse response = new MockHttpServletResponse();

    when(jwtService.verifyAndGetSubject("bad-jwt"))
        .thenThrow(new JWTVerificationException("invalid token"));

    filter.doFilterInternal(request, response, filterChain);

    assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    verify(filterChain).doFilter(request, response);
  }

  @Test
  void doesNotAuthenticateWhenCookieMissing() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    MockHttpServletResponse response = new MockHttpServletResponse();

    filter.doFilterInternal(request, response, filterChain);

    assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    verify(jwtService, never()).verifyAndGetSubject(org.mockito.ArgumentMatchers.anyString());
    verify(filterChain).doFilter(request, response);
  }

  @Test
  void skipsFilterWhenAuthenticationAlreadyPresent() throws Exception {
    SecurityContextHolder.getContext()
        .setAuthentication(new UsernamePasswordAuthenticationToken("existing@example.com", null));

    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setCookies(new Cookie(COOKIE_NAME, "valid-jwt"));
    MockHttpServletResponse response = new MockHttpServletResponse();

    filter.doFilterInternal(request, response, filterChain);

    assertThat(SecurityContextHolder.getContext().getAuthentication().getName())
        .isEqualTo("existing@example.com");
    verify(jwtService, never()).verifyAndGetSubject(org.mockito.ArgumentMatchers.anyString());
    verify(filterChain).doFilter(request, response);
  }
}
