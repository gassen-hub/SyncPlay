package com.playsync3.services;

import com.playsync3.dto.*;
import com.playsync3.entities.TestStatus;
import com.playsync3.repos.TestResultRepository;
import com.playsync3.repos.TestcaseRepository;
import com.playsync3.repos.GeneratedScriptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private TestResultRepository testResultRepository;

    @Autowired
    private TestcaseRepository testcaseRepository;

    @Autowired
    private GeneratedScriptRepository generatedScriptRepository;

    public DashboardAnalyticsDTO getDashboardAnalytics(LocalDate startDate, LocalDate endDate) {
        // Default to last 30 days if no dates provided
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        DashboardAnalyticsDTO analytics = new DashboardAnalyticsDTO();

        // Get execution trends
        analytics.setExecutionTrends(getExecutionTrends(startDateTime, endDateTime));

        // Get pass/fail rates
        analytics.setPassFailRates(getPassFailRates(startDateTime, endDateTime));

        // Get test case analytics
        analytics.setTestCaseAnalytics(getAllTestCaseAnalytics(startDateTime, endDateTime));

        // Get overall stats
        analytics.setOverallStats(getOverallStats(startDateTime, endDateTime));

        return analytics;
    }

    public TestCaseAnalyticsDTO getTestCaseAnalytics(Long testcaseId, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        return getTestCaseAnalyticsByTestcaseId(testcaseId, startDateTime, endDateTime);
    }

    private TestExecutionTrendsDTO getExecutionTrends(LocalDateTime startDate, LocalDateTime endDate) {
        TestExecutionTrendsDTO trends = new TestExecutionTrendsDTO();

        List<LocalDate> dates = new ArrayList<>();
        List<Integer> totalExecutions = new ArrayList<>();
        List<Integer> passedExecutions = new ArrayList<>();
        List<Integer> failedExecutions = new ArrayList<>();

        // Generate date range
        LocalDate current = startDate.toLocalDate();
        while (!current.isAfter(endDate.toLocalDate())) {
            dates.add(current);

            LocalDateTime dayStart = current.atStartOfDay();
            LocalDateTime dayEnd = current.atTime(23, 59, 59);

            List<Object[]> dayStats = testResultRepository.getExecutionStatsByDateRange(dayStart, dayEnd);

            int totalCount = 0;
            int passedCount = 0;
            int failedCount = 0;

            for (Object[] stat : dayStats) {
                TestStatus status = (TestStatus) stat[0];
                Long count = (Long) stat[1];

                totalCount += count.intValue();
                if (status == TestStatus.PASSED) {
                    passedCount = count.intValue();
                } else if (status == TestStatus.FAILED) {
                    failedCount = count.intValue();
                }
            }

            totalExecutions.add(totalCount);
            passedExecutions.add(passedCount);
            failedExecutions.add(failedCount);

            current = current.plusDays(1);
        }

        trends.setDates(dates);
        trends.setTotalExecutions(totalExecutions);
        trends.setPassedExecutions(passedExecutions);
        trends.setFailedExecutions(failedExecutions);

        return trends;
    }

    private PassFailRatesDTO getPassFailRates(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> stats = testResultRepository.getExecutionStatsByDateRange(startDate, endDate);

        long totalTests = 0;
        long passedTests = 0;
        long failedTests = 0;

        for (Object[] stat : stats) {
            TestStatus status = (TestStatus) stat[0];
            Long count = (Long) stat[1];

            totalTests += count;
            if (status == TestStatus.PASSED) {
                passedTests = count;
            } else if (status == TestStatus.FAILED) {
                failedTests = count;
            }
        }

        return new PassFailRatesDTO(totalTests, passedTests, failedTests);
    }

    private List<TestCaseAnalyticsDTO> getAllTestCaseAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        List<TestCaseAnalyticsDTO> analytics = new ArrayList<>();

        // Get all test cases
        List<Object[]> testCaseStats = testResultRepository.getTestCaseExecutionStats(startDate, endDate);

        for (Object[] stat : testCaseStats) {
            Long testcaseId = (Long) stat[0];
            String testcaseName = (String) stat[1];
            Long totalExecutions = (Long) stat[2];
            Long passedExecutions = (Long) stat[3];
            Long failedExecutions = (Long) stat[4];
            Double averageExecutionTime = (Double) stat[5];
            LocalDateTime lastExecuted = (LocalDateTime) stat[6];

            TestCaseAnalyticsDTO dto = new TestCaseAnalyticsDTO();
            dto.setTestcaseId(testcaseId);
            dto.setTestcaseName(testcaseName);
            dto.setTotalExecutions(totalExecutions);
            dto.setPassedExecutions(passedExecutions);
            dto.setFailedExecutions(failedExecutions);
            dto.setPassRate(totalExecutions > 0 ? (double) passedExecutions / totalExecutions * 100 : 0);
            dto.setAverageExecutionTime(averageExecutionTime != null ? averageExecutionTime : 0);
            dto.setLastExecuted(lastExecuted);

            analytics.add(dto);
        }

        return analytics;
    }

    private TestCaseAnalyticsDTO getTestCaseAnalyticsByTestcaseId(Long testcaseId, LocalDateTime startDate, LocalDateTime endDate) {
        Object[] stat = testResultRepository.getTestCaseExecutionStatsByTestcaseId(testcaseId, startDate, endDate);

        if (stat == null) {
            return new TestCaseAnalyticsDTO();
        }

        String testcaseName = (String) stat[0];
        Long totalExecutions = (Long) stat[1];
        Long passedExecutions = (Long) stat[2];
        Long failedExecutions = (Long) stat[3];
        Double averageExecutionTime = (Double) stat[4];
        LocalDateTime lastExecuted = (LocalDateTime) stat[5];

        TestCaseAnalyticsDTO dto = new TestCaseAnalyticsDTO();
        dto.setTestcaseId(testcaseId);
        dto.setTestcaseName(testcaseName);
        dto.setTotalExecutions(totalExecutions);
        dto.setPassedExecutions(passedExecutions);
        dto.setFailedExecutions(failedExecutions);
        dto.setPassRate(totalExecutions > 0 ? (double) passedExecutions / totalExecutions * 100 : 0);
        dto.setAverageExecutionTime(averageExecutionTime != null ? averageExecutionTime : 0);
        dto.setLastExecuted(lastExecuted);

        return dto;
    }

    private OverallStatsDTO getOverallStats(LocalDateTime startDate, LocalDateTime endDate) {
        OverallStatsDTO stats = new OverallStatsDTO();

        // Get total test cases
        long totalTestCases = testcaseRepository.count();

        // Get execution stats
        List<Object[]> executionStats = testResultRepository.getExecutionStatsByDateRange(startDate, endDate);

        long totalExecutions = 0;
        long totalPassedExecutions = 0;
        long totalFailedExecutions = 0;

        for (Object[] stat : executionStats) {
            TestStatus status = (TestStatus) stat[0];
            Long count = (Long) stat[1];

            totalExecutions += count;
            if (status == TestStatus.PASSED) {
                totalPassedExecutions = count;
            } else if (status == TestStatus.FAILED) {
                totalFailedExecutions = count;
            }
        }

        // Get average execution time
        Double averageExecutionTime = testResultRepository.getAverageExecutionTime(startDate, endDate);

        stats.setTotalTestCases(totalTestCases);
        stats.setTotalExecutions(totalExecutions);
        stats.setTotalPassedExecutions(totalPassedExecutions);
        stats.setTotalFailedExecutions(totalFailedExecutions);
        stats.setOverallPassRate(totalExecutions > 0 ? (double) totalPassedExecutions / totalExecutions * 100 : 0);
        stats.setAverageExecutionTime(averageExecutionTime != null ? averageExecutionTime : 0);

        return stats;
    }
}
