package com.playsync3.dto;

public class PassFailRatesDTO {
    private long totalTests;
    private long passedTests;
    private long failedTests;
    private double passRate;
    private double failRate;

    // Constructors
    public PassFailRatesDTO() {}

    public PassFailRatesDTO(long totalTests, long passedTests, long failedTests) {
        this.totalTests = totalTests;
        this.passedTests = passedTests;
        this.failedTests = failedTests;
        this.passRate = totalTests > 0 ? (double) passedTests / totalTests * 100 : 0;
        this.failRate = totalTests > 0 ? (double) failedTests / totalTests * 100 : 0;
    }

    // Getters and Setters
    public long getTotalTests() { return totalTests; }
    public void setTotalTests(long totalTests) { this.totalTests = totalTests; }

    public long getPassedTests() { return passedTests; }
    public void setPassedTests(long passedTests) { this.passedTests = passedTests; }

    public long getFailedTests() { return failedTests; }
    public void setFailedTests(long failedTests) { this.failedTests = failedTests; }

    public double getPassRate() { return passRate; }
    public void setPassRate(double passRate) { this.passRate = passRate; }

    public double getFailRate() { return failRate; }
    public void setFailRate(double failRate) { this.failRate = failRate; }
}