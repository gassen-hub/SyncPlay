package com.playsync3.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "schedule_history")
public class ScheduleHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "schedule_id", nullable = false)
    private Long scheduleId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduleHistoryType type;

    // For EXECUTION type
    @Enumerated(EnumType.STRING)
    @Column(name = "test_status")
    private TestStatus testStatus;

    @Column(name = "execution_time")
    private Long executionTime;

    @Column(name = "test_output", columnDefinition = "TEXT")
    private String testOutput;

    // For STATUS_CHANGE type
    @Enumerated(EnumType.STRING)
    @Column(name = "old_status")
    private ScheduleStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status")
    private ScheduleStatus newStatus;

    @Column(name = "change_reason")
    private String changeReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public ScheduleHistory() {}

    // Constructor for execution history
    public ScheduleHistory(Long scheduleId, TestStatus testStatus, Long executionTime, String testOutput) {
        this.scheduleId = scheduleId;
        this.type = ScheduleHistoryType.EXECUTION;
        this.testStatus = testStatus;
        this.executionTime = executionTime;
        this.testOutput = testOutput;
    }

    // Constructor for status change history
    public ScheduleHistory(Long scheduleId, ScheduleStatus oldStatus, ScheduleStatus newStatus, String changeReason) {
        this.scheduleId = scheduleId;
        this.type = ScheduleHistoryType.STATUS_CHANGE;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.changeReason = changeReason;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getScheduleId() { return scheduleId; }
    public void setScheduleId(Long scheduleId) { this.scheduleId = scheduleId; }

    public ScheduleHistoryType getType() { return type; }
    public void setType(ScheduleHistoryType type) { this.type = type; }

    public TestStatus getTestStatus() { return testStatus; }
    public void setTestStatus(TestStatus testStatus) { this.testStatus = testStatus; }

    public Long getExecutionTime() { return executionTime; }
    public void setExecutionTime(Long executionTime) { this.executionTime = executionTime; }

    public String getTestOutput() { return testOutput; }
    public void setTestOutput(String testOutput) { this.testOutput = testOutput; }

    public ScheduleStatus getOldStatus() { return oldStatus; }
    public void setOldStatus(ScheduleStatus oldStatus) { this.oldStatus = oldStatus; }

    public ScheduleStatus getNewStatus() { return newStatus; }
    public void setNewStatus(ScheduleStatus newStatus) { this.newStatus = newStatus; }

    public String getChangeReason() { return changeReason; }
    public void setChangeReason(String changeReason) { this.changeReason = changeReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}