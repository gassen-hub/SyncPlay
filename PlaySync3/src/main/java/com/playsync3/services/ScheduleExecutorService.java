package com.playsync3.services;

import com.playsync3.dto.GeneratedScriptDTO;
import com.playsync3.dto.ScheduleDTO;
import com.playsync3.dto.TestResultDTO;
import com.playsync3.entities.Schedule;
import com.playsync3.entities.ScheduleStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleExecutorService {

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private GeneratedScriptService generatedScriptService;

    @Autowired
    private PlaywrightService playwrightService;

    @Autowired
    private EmailService emailService; // ADD THIS

    // Run every minute to check for scheduled executions
    @Scheduled(fixedRate = 60000) // 60 seconds
    public void executeScheduledTests() {
        try {
            List<Schedule> schedulesToExecute = scheduleService.getSchedulesToExecute();

            for (Schedule schedule : schedulesToExecute) {
                executeScheduledTest(schedule);
            }
        } catch (Exception e) {
            System.err.println("Error in scheduled execution: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void executeScheduledTest(Schedule schedule) {
        try {
            System.out.println("Executing scheduled test for schedule ID: " + schedule.getId());

            // Get the script
            GeneratedScriptDTO script = generatedScriptService.getScriptById(schedule.getScriptId())
                    .orElseThrow(() -> new RuntimeException("Script not found for schedule: " + schedule.getId()));

            // Execute the test
            TestResultDTO result = playwrightService.executeTest(script);

            // Record the execution
            scheduleService.recordExecution(
                    schedule.getId(),
                    result.getStatus(),
                    result.getExecutionTime(),
                    result.getOutput()
            );

            // Send email notification if configured
            ScheduleDTO scheduleDTO = scheduleService.getScheduleById(schedule.getId()).orElse(null);
            if (scheduleDTO != null && scheduleDTO.getNotificationEmail() != null && !scheduleDTO.getNotificationEmail().trim().isEmpty()) {
                emailService.sendTestResultEmail(scheduleDTO, result.getStatus(), result.getExecutionTime(), result.getOutput());
            }

            System.out.println("Scheduled test completed for schedule ID: " + schedule.getId() +
                    ", Status: " + result.getStatus());

        } catch (Exception e) {
            System.err.println("Failed to execute scheduled test for schedule ID: " + schedule.getId() +
                    ", Error: " + e.getMessage());

            // Record the failure
            scheduleService.recordExecution(
                    schedule.getId(),
                    com.playsync3.entities.TestStatus.FAILED,
                    0L,
                    "Execution failed: " + e.getMessage()
            );

            // Send failure email notification
            try {
                ScheduleDTO scheduleDTO = scheduleService.getScheduleById(schedule.getId()).orElse(null);
                if (scheduleDTO != null && scheduleDTO.getNotificationEmail() != null && !scheduleDTO.getNotificationEmail().trim().isEmpty()) {
                    emailService.sendTestResultEmail(scheduleDTO, com.playsync3.entities.TestStatus.FAILED, 0L, "Execution failed: " + e.getMessage());
                }
            } catch (Exception emailException) {
                System.err.println("Failed to send failure notification email: " + emailException.getMessage());
            }
        }
    }
}