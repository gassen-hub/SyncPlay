package com.playsync3.dto;

import com.playsync3.entities.TestStatus;
import java.time.LocalDateTime;

public class TestResultDTO {
    private Long id;
    private Long scriptId;
    private TestStatus status;
    private String output;
    private Long executionTime;
    private LocalDateTime createdAt;

    // Constructors
    public TestResultDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getScriptId() { return scriptId; }
    public void setScriptId(Long scriptId) { this.scriptId = scriptId; }

    public TestStatus getStatus() { return status; }
    public void setStatus(TestStatus status) { this.status = status; }

    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }

    public Long getExecutionTime() { return executionTime; }
    public void setExecutionTime(Long executionTime) { this.executionTime = executionTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
