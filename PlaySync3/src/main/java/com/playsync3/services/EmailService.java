package com.playsync3.services;


import com.playsync3.dto.ScheduleDTO;
import com.playsync3.entities.TestStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");

    public void sendTestResultEmail(ScheduleDTO schedule, TestStatus testStatus, Long executionTime, String testOutput) {
        if (schedule.getNotificationEmail() == null || schedule.getNotificationEmail().trim().isEmpty()) {
            return; // No email configured for this schedule
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(schedule.getNotificationEmail());
            helper.setSubject(getEmailSubject(schedule, testStatus));
            helper.setText(generateEmailContent(schedule, testStatus, executionTime, testOutput), true);
            helper.setFrom("big97394@gmail.com"); // Your configured email

            mailSender.send(message);
            System.out.println("Test result email sent successfully to: " + schedule.getNotificationEmail());

        } catch (MessagingException e) {
            System.err.println("Failed to send email for schedule: " + schedule.getName() +
                    ", Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String getEmailSubject(ScheduleDTO schedule, TestStatus testStatus) {
        String statusEmoji = getStatusEmoji(testStatus);
        return String.format("%s Test Execution: %s - %s",
                statusEmoji, schedule.getName(), testStatus.toString());
    }

    private String getStatusEmoji(TestStatus status) {
        switch (status) {
            case PASSED: return "✅";
            case FAILED: return "❌";
            case SKIPPED: return "⏭️";
            default: return "⚠️";
        }
    }

    private String generateEmailContent(ScheduleDTO schedule, TestStatus testStatus, Long executionTime, String testOutput) {
        String statusColor = getStatusColor(testStatus);
        String statusBadge = getStatusBadge(testStatus);
        String executionTimeFormatted = formatExecutionTime(executionTime);
        String currentTime = LocalDateTime.now().format(DATE_FORMATTER);

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Test Execution Report</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
                    .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 14px; }
                    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin: 15px 0; %s }
                    .content { padding: 30px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
                    .info-item { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
                    .info-item h3 { margin: 0 0 8px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
                    .info-item p { margin: 0; font-size: 16px; font-weight: 500; color: #333; }
                    .output-section { margin-top: 25px; }
                    .output-section h3 { color: #333; margin-bottom: 15px; font-size: 18px; }
                    .output-box { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; font-family: 'Courier New', monospace; font-size: 12px; color: #495057; white-space: pre-wrap; max-height: 300px; overflow-y: auto; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #dee2e6; }
                    .footer a { color: #667eea; text-decoration: none; }
                    @media (max-width: 600px) {
                        .info-grid { grid-template-columns: 1fr; }
                        .container { margin: 10px; }
                        body { padding: 10px; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🧪 Test Execution Report</h1>
                        <p>Automated test execution completed</p>
                    </div>
                    
                    <div class="content">
                        <div class="status-badge">
                            %s %s
                        </div>
                        
                        <div class="info-grid">
                            <div class="info-item">
                                <h3>Schedule Name</h3>
                                <p>%s</p>
                            </div>
                            <div class="info-item">
                                <h3>Test Script</h3>
                                <p>%s</p>
                            </div>
                            <div class="info-item">
                                <h3>Execution Time</h3>
                                <p>%s</p>
                            </div>
                            <div class="info-item">
                                <h3>Completed At</h3>
                                <p>%s</p>
                            </div>
                            <div class="info-item">
                                <h3>Test Case</h3>
                                <p>%s</p>
                            </div>
                            <div class="info-item">
                                <h3>Frequency</h3>
                                <p>%s</p>
                            </div>
                        </div>
                        
                        %s
                    </div>
                    
                    <div class="footer">
                        <p>This email was automatically generated by PlaySync3 Test Scheduler</p>
                        <p>© 2024 PlaySync3 | <a href="#" style="color: #667eea;">View Dashboard</a></p>
                    </div>
                </div>
            </body>
            </html>
            """,
                statusColor,
                getStatusEmoji(testStatus),
                testStatus.toString(),
                escapeHtml(schedule.getName()),
                escapeHtml(schedule.getScriptFileName() != null ? schedule.getScriptFileName() : "N/A"),
                executionTimeFormatted,
                currentTime,
                escapeHtml(schedule.getTestcaseName() != null ? schedule.getTestcaseName() : "N/A"),
                schedule.getFrequency().toString(),
                generateOutputSection(testOutput)
        );
    }

    private String getStatusColor(TestStatus status) {
        switch (status) {
            case PASSED: return "background: #d4edda; color: #155724; border: 1px solid #c3e6cb;";
            case FAILED: return "background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;";
            case SKIPPED: return "background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;";
            default: return "background: #e2e3e5; color: #383d41; border: 1px solid #d6d8db;";
        }
    }

    private String getStatusBadge(TestStatus status) {
        return status.toString();
    }

    private String formatExecutionTime(Long executionTime) {
        if (executionTime == null || executionTime == 0) {
            return "N/A";
        }

        if (executionTime < 1000) {
            return executionTime + "ms";
        } else if (executionTime < 60000) {
            return String.format("%.1fs", executionTime / 1000.0);
        } else {
            long minutes = executionTime / 60000;
            long seconds = (executionTime % 60000) / 1000;
            return String.format("%dm %ds", minutes, seconds);
        }
    }

    private String generateOutputSection(String testOutput) {
        if (testOutput == null || testOutput.trim().isEmpty()) {
            return "";
        }

        // Truncate output if too long
        String truncatedOutput = testOutput.length() > 2000 ?
                testOutput.substring(0, 2000) + "\n\n... (output truncated)" :
                testOutput;

        return String.format("""
            <div class="output-section">
                <h3>📋 Test Output</h3>
                <div class="output-box">%s</div>
            </div>
            """, escapeHtml(truncatedOutput));
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}