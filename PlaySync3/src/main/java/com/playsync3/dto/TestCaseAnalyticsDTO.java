package com.playsync3.dto;

import java.time.LocalDateTime;

public class TestCaseAnalyticsDTO {
    private Long testcaseId;
    private String testcaseName;
    private long totalExecutions;
    private long passedExecutions;
    private long failedExecutions;
    private double passRate;
    private double averageExecutionTime;
    private LocalDateTime lastExecuted;

    // Constructors
    public TestCaseAnalyticsDTO() {}

    // Getters and Setters
    public Long getTestcaseId() { return testcaseId; }
    public void setTestcaseId(Long testcaseId) { this.testcaseId = testcaseId; }

    public String getTestcaseName() { return testcaseName; }
    public void setTestcaseName(String testcaseName) { this.testcaseName = testcaseName; }

    public long getTotalExecutions() { return totalExecutions; }
    public void setTotalExecutions(long totalExecutions) { this.totalExecutions = totalExecutions; }

    public long getPassedExecutions() { return passedExecutions; }
    public void setPassedExecutions(long passedExecutions) { this.passedExecutions = passedExecutions; }

    public long getFailedExecutions() { return failedExecutions; }
    public void setFailedExecutions(long failedExecutions) { this.failedExecutions = failedExecutions; }

    public double getPassRate() { return passRate; }
    public void setPassRate(double passRate) { this.passRate = passRate; }

    public double getAverageExecutionTime() { return averageExecutionTime; }
    public void setAverageExecutionTime(double averageExecutionTime) { this.averageExecutionTime = averageExecutionTime; }

    public LocalDateTime getLastExecuted() { return lastExecuted; }
    public void setLastExecuted(LocalDateTime lastExecuted) { this.lastExecuted = lastExecuted; }
}