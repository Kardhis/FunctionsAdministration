package com.example.backend.objectives.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.objectives.ObjectiveStatus;
import com.example.backend.objectives.ObjectiveStatusRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class ObjectiveStatusesControllerTest {

  @Mock ObjectiveStatusRepository statusRepository;

  MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.standaloneSetup(new ObjectiveStatusesController(statusRepository)).build();
  }

  @Test
  void listReturnsAllStatuses() throws Exception {
    ObjectiveStatus inProgress = objectiveStatus(1L, "IN_PROGRESS", "In progress");
    ObjectiveStatus done = objectiveStatus(2L, "DONE", "Done");
    when(statusRepository.findAll()).thenReturn(List.of(inProgress, done));

    mockMvc
        .perform(get("/api/objective-statuses"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].code").value("IN_PROGRESS"))
        .andExpect(jsonPath("$[1].code").value("DONE"));
  }

  private static ObjectiveStatus objectiveStatus(Long id, String code, String label) {
    ObjectiveStatus status = new ObjectiveStatus();
    status.setId(id);
    status.setCode(code);
    status.setLabel(label);
    return status;
  }
}
