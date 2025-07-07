package com.playsync3.dto;

import com.playsync3.entities.ScriptStatus;
import java.time.LocalDateTime;

public class GeneratedScriptDTO {
    private Long id;
    private Long testcaseId;
    private String scriptContent;
    private String fileName;
    private ScriptStatus status;
    private LocalDateTime createdAt;

    // Constructors
    public GeneratedScriptDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTestcaseId() { return testcaseId; }
    public void setTestcaseId(Long testcaseId) { this.testcaseId = testcaseId; }

    public String getScriptContent() { return scriptContent; }
    public void setScriptContent(String scriptContent) { this.scriptContent = scriptContent; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public ScriptStatus getStatus() { return status; }
    public void setStatus(ScriptStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
