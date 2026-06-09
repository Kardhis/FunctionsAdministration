package com.example.backend.tasks.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.tasks.TaskStatus;
import com.example.backend.tasks.TaskStatusRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class TaskStatusesControllerTest {

  @Mock TaskStatusRepository statusRepository;

  MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(new TaskStatusesController(statusRepository)).build();
  }

  @Test
  void shouldListTaskStatusesWhenRequested() throws Exception {
    when(statusRepository.findAllByOrderByIdAsc())
        .thenReturn(
            List.of(
                taskStatusEntity(1L, "BACKLOG", "Backlog"),
                taskStatusEntity(2L, "PENDIENTE", "Pendent")));

    mockMvc
        .perform(get("/api/task-statuses"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].code").value("BACKLOG"))
        .andExpect(jsonPath("$[1].code").value("PENDIENTE"));
  }

  private static TaskStatus taskStatusEntity(Long id, String code, String label) {
    TaskStatus status = new TaskStatus();
    ReflectionTestUtils.setField(status, "id", id);
    status.setCode(code);
    status.setLabel(label);
    return status;
  }
}
