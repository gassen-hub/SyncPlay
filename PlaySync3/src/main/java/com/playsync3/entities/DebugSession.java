package com.playsync3.entities;


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "debug_sessions")
public class DebugSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "testcase_id", nullable = false)
    private Long testcaseId;

    @Column(name = "script_id", nullable = false)
    private Long scriptId;

    @Column(name = "session_id", nullable = false, unique = true)
    private String sessionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DebugStatus status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "user_session")
    private String userSession; // To track which user started the debug

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
        status = DebugStatus.STARTING;
    }

    // Constructors
    public DebugSession() {}

    public DebugSession(Long testcaseId, Long scriptId, String sessionId, String userSession) {
        this.testcaseId = testcaseId;
        this.scriptId = scriptId;
        this.sessionId = sessionId;
        this.userSession = userSession;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTestcaseId() { return testcaseId; }
    public void setTestcaseId(Long testcaseId) { this.testcaseId = testcaseId; }

    public Long getScriptId() { return scriptId; }
    public void setScriptId(Long scriptId) { this.scriptId = scriptId; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public DebugStatus getStatus() { return status; }
    public void setStatus(DebugStatus status) { this.status = status; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }

    public String getUserSession() { return userSession; }
    public void setUserSession(String userSession) { this.userSession = userSession; }
}