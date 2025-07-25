package com.playsync3.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_screenshots")
public class TestScreenshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "test_result_id", nullable = false)
    private Long testResultId;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Enumerated(EnumType.STRING)
    @Column(name = "screenshot_type", nullable = false)
    private ScreenshotType screenshotType;

    @Column(name = "step_name")
    private String stepName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public TestScreenshot() {}

    public TestScreenshot(Long testResultId, String filePath, String fileName,
                          ScreenshotType screenshotType, String stepName) {
        this.testResultId = testResultId;
        this.filePath = filePath;
        this.fileName = fileName;
        this.screenshotType = screenshotType;
        this.stepName = stepName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTestResultId() { return testResultId; }
    public void setTestResultId(Long testResultId) { this.testResultId = testResultId; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public ScreenshotType getScreenshotType() { return screenshotType; }
    public void setScreenshotType(ScreenshotType screenshotType) { this.screenshotType = screenshotType; }

    public String getStepName() { return stepName; }
    public void setStepName(String stepName) { this.stepName = stepName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}