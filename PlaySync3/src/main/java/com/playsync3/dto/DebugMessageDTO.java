package com.playsync3.dto;

import java.time.LocalDateTime;

public class DebugMessageDTO {
    private String type; // CONSOLE_LOG, BROWSER_ACTION, ERROR, STATUS
    private String sessionId;
    private Long testcaseId;
    private String message;
    private String level; // INFO, WARN, ERROR, DEBUG
    private LocalDateTime timestamp;
    private Object data; // Additional data if needed

    public DebugMessageDTO() {
        this.timestamp = LocalDateTime.now();
    }

    public DebugMessageDTO(String type, String sessionId, Long testcaseId, String message, String level) {
        this();
        this.type = type;
        this.sessionId = sessionId;
        this.testcaseId = testcaseId;
        this.message = message;
        this.level = level;
    }

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public Long getTestcaseId() { return testcaseId; }
    public void setTestcaseId(Long testcaseId) { this.testcaseId = testcaseId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }
}

