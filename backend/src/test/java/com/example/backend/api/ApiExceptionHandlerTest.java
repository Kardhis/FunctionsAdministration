package com.example.backend.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

class ApiExceptionHandlerTest {

  MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(new ThrowingController())
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
  }

  @Test
  void handlesResponseStatusException() throws Exception {
    mockMvc
        .perform(get("/test/bad-request"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("invalid_input"));
  }

  @Test
  void handlesUnhandledException() throws Exception {
    mockMvc
        .perform(get("/test/unhandled"))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").value("internal_error"));
  }

  @RestController
  static class ThrowingController {

    @GetMapping("/test/bad-request")
    void badRequest() {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid_input");
    }

    @GetMapping("/test/unhandled")
    void unhandled() {
      throw new RuntimeException("boom");
    }
  }
}
