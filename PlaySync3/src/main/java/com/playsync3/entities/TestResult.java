package com.playsync3.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "test_results")
public class TestResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "script_id", nullable = false)
    private Long scriptId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TestStatus status;

    @Column(name = "output", columnDefinition = "TEXT")
    private String output;

    @Column(name = "execution_time")
    private Long executionTime; // in milliseconds

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // New fields for media support
    @ElementCollection
    @CollectionTable(name = "test_screenshots", joinColumns = @JoinColumn(name = "test_result_id"))
    @Column(name = "screenshot_path")
    private List<String> screenshotPaths;

    @Column(name = "video_path")
    private String videoPath;

    @Column(name = "browser_info")
    private String browserInfo;

    @Column(name = "test_duration")
    private Long testDuration; // Total test duration in milliseconds

    @Column(name = "steps_executed")
    private Integer stepsExecuted;

    @Column(name = "total_steps")
    private Integer totalSteps;

    @Column(name = "error_message")
    private String errorMessage;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public TestResult() {}

    public TestResult(Long scriptId, TestStatus status, String output, Long executionTime) {
        this.scriptId = scriptId;
        this.status = status;
        this.output = output;
        this.executionTime = executionTime;
    }

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

    public List<String> getScreenshotPaths() { return screenshotPaths; }
    public void setScreenshotPaths(List<String> screenshotPaths) { this.screenshotPaths = screenshotPaths; }

    public String getVideoPath() { return videoPath; }
    public void setVideoPath(String videoPath) { this.videoPath = videoPath; }

    public String getBrowserInfo() { return browserInfo; }
    public void setBrowserInfo(String browserInfo) { this.browserInfo = browserInfo; }

    public Long getTestDuration() { return testDuration; }
    public void setTestDuration(Long testDuration) { this.testDuration = testDuration; }

    public Integer getStepsExecuted() { return stepsExecuted; }
    public void setStepsExecuted(Integer stepsExecuted) { this.stepsExecuted = stepsExecuted; }

    public Integer getTotalSteps() { return totalSteps; }
    public void setTotalSteps(Integer totalSteps) { this.totalSteps = totalSteps; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
