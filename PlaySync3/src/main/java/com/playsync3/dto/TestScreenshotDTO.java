package com.playsync3.dto;

import com.playsync3.entities.ScreenshotType;
import java.time.LocalDateTime;

public class TestScreenshotDTO {
    private Long id;
    private Long testResultId;
    private String filePath;
    private String fileName;
    private ScreenshotType screenshotType;
    private String stepName;
    private LocalDateTime createdAt;

    // Constructors
    public TestScreenshotDTO() {}

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
