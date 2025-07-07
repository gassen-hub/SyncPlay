package com.playsync3.dto;

import com.playsync3.entities.TestStatus;
import java.time.LocalDateTime;

public class TestExecutionMessage {
    private Long testCaseId;
    private Long scriptId;
    private TestStatus status;
    private String message;
    private String output;
    private String inspectorUrl;
    private Integer inspectorPort;
    private LocalDateTime timestamp;
    private String phase; // STARTING, RUNNING, INSPECTOR_READY, COMPLETED, ERROR

    public TestExecutionMessage() {}

    public TestExecutionMessage(Long testCaseId, Long scriptId, String phase, String message) {
        this.testCaseId = testCaseId;
        this.scriptId = scriptId;
        this.phase = phase;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getTestCaseId() { return testCaseId; }
    public void setTestCaseId(Long testCaseId) { this.testCaseId = testCaseId; }

    public Long getScriptId() { return scriptId; }
    public void setScriptId(Long scriptId) { this.scriptId = scriptId; }

    public TestStatus getStatus() { return status; }
    public void setStatus(TestStatus status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }

    public String getInspectorUrl() { return inspectorUrl; }
    public void setInspectorUrl(String inspectorUrl) { this.inspectorUrl = inspectorUrl; }

    public Integer getInspectorPort() { return inspectorPort; }
    public void setInspectorPort(Integer inspectorPort) { this.inspectorPort = inspectorPort; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getPhase() { return phase; }
    public void setPhase(String phase) { this.phase = phase; }
}