package com.example.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info =
        @Info(
            title = "FunctionsAdministration API",
            version = "v1",
            description = "API para administración de usuarios (RBAC) y módulo de hábitos."))
public class OpenApiConfig {}

