package com.playsync3.controller;

import com.playsync3.dto.DashboardAnalyticsDTO;
import com.playsync3.dto.TestCaseAnalyticsDTO;
import com.playsync3.dto.TestScreenshotDTO;
import com.playsync3.services.DashboardService;
import com.playsync3.services.TestScreenshotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private TestScreenshotService testScreenshotService;

    @GetMapping("/analytics")
    public ResponseEntity<DashboardAnalyticsDTO> getDashboardAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        DashboardAnalyticsDTO analytics = dashboardService.getDashboardAnalytics(startDate, endDate);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/testcase/{testcaseId}/analytics")
    public ResponseEntity<TestCaseAnalyticsDTO> getTestCaseAnalytics(
            @PathVariable Long testcaseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        TestCaseAnalyticsDTO analytics = dashboardService.getTestCaseAnalytics(testcaseId, startDate, endDate);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/testcase/{testcaseId}/screenshots")
    public ResponseEntity<List<TestScreenshotDTO>> getTestCaseScreenshots(@PathVariable Long testcaseId) {
        List<TestScreenshotDTO> screenshots = testScreenshotService.getScreenshotsByTestCaseId(testcaseId);
        return ResponseEntity.ok(screenshots);
    }

    @GetMapping("/result/{resultId}/screenshots")
    public ResponseEntity<List<TestScreenshotDTO>> getTestResultScreenshots(@PathVariable Long resultId) {
        List<TestScreenshotDTO> screenshots = testScreenshotService.getScreenshotsByTestResultId(resultId);
        return ResponseEntity.ok(screenshots);
    }
}
