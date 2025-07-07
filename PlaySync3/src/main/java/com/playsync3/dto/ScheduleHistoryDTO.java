package com.playsync3.dto;

import com.playsync3.entities.ScheduleHistoryType;
import com.playsync3.entities.ScheduleStatus;
import com.playsync3.entities.TestStatus;
import java.time.LocalDateTime;

public class ScheduleHistoryDTO {
    private Long id;
    private Long scheduleId;
    private ScheduleHistoryType type;

    // For execution history
    private TestStatus testStatus;
    private Long executionTime;
    private String testOutput;

    // For status change history
    private ScheduleStatus oldStatus;
    private ScheduleStatus newStatus;
    private String changeReason;

    private LocalDateTime createdAt;

    // Additional fields for display
    private String scheduleName;

    // Constructors
    public ScheduleHistoryDTO() {}

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

    public String getScheduleName() { return scheduleName; }
    public void setScheduleName(String scheduleName) { this.scheduleName = scheduleName; }
}