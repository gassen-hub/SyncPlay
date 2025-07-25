package com.playsync3.dto;


import java.time.LocalDate;
import java.util.List;

public class TestExecutionTrendsDTO {
    private List<LocalDate> dates;
    private List<Integer> totalExecutions;
    private List<Integer> passedExecutions;
    private List<Integer> failedExecutions;

    // Constructors
    public TestExecutionTrendsDTO() {}

    // Getters and Setters
    public List<LocalDate> getDates() { return dates; }
    public void setDates(List<LocalDate> dates) { this.dates = dates; }

    public List<Integer> getTotalExecutions() { return totalExecutions; }
    public void setTotalExecutions(List<Integer> totalExecutions) { this.totalExecutions = totalExecutions; }

    public List<Integer> getPassedExecutions() { return passedExecutions; }
    public void setPassedExecutions(List<Integer> passedExecutions) { this.passedExecutions = passedExecutions; }

    public List<Integer> getFailedExecutions() { return failedExecutions; }
    public void setFailedExecutions(List<Integer> failedExecutions) { this.failedExecutions = failedExecutions; }
}

