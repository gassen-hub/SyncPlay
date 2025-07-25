package com.playsync3.dto;

import java.time.LocalDate;
import java.util.List;

public class DashboardAnalyticsDTO {
    private TestExecutionTrendsDTO executionTrends;
    private PassFailRatesDTO passFailRates;
    private List<TestCaseAnalyticsDTO> testCaseAnalytics;
    private OverallStatsDTO overallStats;

    // Constructors
    public DashboardAnalyticsDTO() {}

    // Getters and Setters
    public TestExecutionTrendsDTO getExecutionTrends() { return executionTrends; }
    public void setExecutionTrends(TestExecutionTrendsDTO executionTrends) { this.executionTrends = executionTrends; }

    public PassFailRatesDTO getPassFailRates() { return passFailRates; }
    public void setPassFailRates(PassFailRatesDTO passFailRates) { this.passFailRates = passFailRates; }

    public List<TestCaseAnalyticsDTO> getTestCaseAnalytics() { return testCaseAnalytics; }
    public void setTestCaseAnalytics(List<TestCaseAnalyticsDTO> testCaseAnalytics) { this.testCaseAnalytics = testCaseAnalytics; }

    public OverallStatsDTO getOverallStats() { return overallStats; }
    public void setOverallStats(OverallStatsDTO overallStats) { this.overallStats = overallStats; }
}
