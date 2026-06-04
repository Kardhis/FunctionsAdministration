package com.example.backend.tasks;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "task_statuses")
public class TaskStatus {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "code", nullable = false, length = 32, unique = true)
  private String code;

  @Column(name = "label", length = 64)
  private String label;

  public Long getId() { return id; }

  public String getCode() { return code; }
  public void setCode(String code) { this.code = code; }

  public String getLabel() { return label; }
  public void setLabel(String label) { this.label = label; }
}
