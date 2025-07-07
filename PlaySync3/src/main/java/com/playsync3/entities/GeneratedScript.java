package com.playsync3.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "generated_scripts")
public class GeneratedScript {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "testcase_id", nullable = false)
    private Long testcaseId;

    @Column(name = "script_content", columnDefinition = "TEXT")
    private String scriptContent;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScriptStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public GeneratedScript() {}

    public GeneratedScript(Long testcaseId, String scriptContent, String fileName, ScriptStatus status) {
        this.testcaseId = testcaseId;
        this.scriptContent = scriptContent;
        this.fileName = fileName;
        this.status = status;
    }

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
