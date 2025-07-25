package com.playsync3.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "screenshots")
public class Screenshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "test_result_id", nullable = false)
    private Long testResultId;

    @Column(name = "step_name")
    private String stepName;

    @Column(name = "screenshot_path", nullable = false)
    private String screenshotPath;

    @Enumerated(EnumType.STRING)
    @Column(name = "screenshot_type", nullable = false)
    private ScreenshotType screenshotType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public Screenshot() {}

    public Screenshot(Long testResultId, String stepName, String screenshotPath, ScreenshotType screenshotType) {
        this.testResultId = testResultId;
        this.stepName = stepName;
        this.screenshotPath = screenshotPath;
        this.screenshotType = screenshotType;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTestResultId() { return testResultId; }
    public void setTestResultId(Long testResultId) { this.testResultId = testResultId; }

    public String getStepName() { return stepName; }
    public void setStepName(String stepName) { this.stepName = stepName; }

    public String getScreenshotPath() { return screenshotPath; }
    public void setScreenshotPath(String screenshotPath) { this.screenshotPath = screenshotPath; }

    public ScreenshotType getScreenshotType() { return screenshotType; }
    public void setScreenshotType(ScreenshotType screenshotType) { this.screenshotType = screenshotType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

