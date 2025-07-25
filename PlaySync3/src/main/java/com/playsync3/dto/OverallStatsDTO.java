package com.playsync3.dto;

public class OverallStatsDTO {
    private long totalTestCases;
    private long totalExecutions;
    private long totalPassedExecutions;
    private long totalFailedExecutions;
    private double overallPassRate;
    private double averageExecutionTime;

    // Constructors
    public OverallStatsDTO() {}

    // Getters and Setters
    public long getTotalTestCases() { return totalTestCases; }
    public void setTotalTestCases(long totalTestCases) { this.totalTestCases = totalTestCases; }

    public long getTotalExecutions() { return totalExecutions; }
    public void setTotalExecutions(long totalExecutions) { this.totalExecutions = totalExecutions; }

    public long getTotalPassedExecutions() { return totalPassedExecutions; }
    public void setTotalPassedExecutions(long totalPassedExecutions) { this.totalPassedExecutions = totalPassedExecutions; }

    public long getTotalFailedExecutions() { return totalFailedExecutions; }
    public void setTotalFailedExecutions(long totalFailedExecutions) { this.totalFailedExecutions = totalFailedExecutions; }

    public double getOverallPassRate() { return overallPassRate; }
    public void setOverallPassRate(double overallPassRate) { this.overallPassRate = overallPassRate; }

    public double getAverageExecutionTime() { return averageExecutionTime; }
    public void setAverageExecutionTime(double averageExecutionTime) { this.averageExecutionTime = averageExecutionTime; }
}
