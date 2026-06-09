package com.example.backend.support;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

  @Container
  static final MySQLContainer<?> MYSQL =
      new MySQLContainer<>("mysql:8.0")
          .withDatabaseName("functions_test")
          .withUsername("test")
          .withPassword("test");

  @DynamicPropertySource
  static void configureDatasource(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
    registry.add("spring.datasource.username", MYSQL::getUsername);
    registry.add("spring.datasource.password", MYSQL::getPassword);
    registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
    registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.MySQLDialect");
  }
}
