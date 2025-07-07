package com.playsync3.services;

import com.playsync3.dto.ScheduleDTO;
import com.playsync3.dto.ScheduleHistoryDTO;
import com.playsync3.entities.*;
import com.playsync3.repos.ScheduleRepository;
import com.playsync3.repos.ScheduleHistoryRepository;
import com.playsync3.repos.GeneratedScriptRepository;
import com.playsync3.repos.TestcaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private ScheduleHistoryRepository scheduleHistoryRepository;

    @Autowired
    private GeneratedScriptRepository generatedScriptRepository;

    @Autowired
    private TestcaseRepository testcaseRepository;

    public List<ScheduleDTO> getAllSchedules() {
        return scheduleRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<ScheduleDTO> getScheduleById(Long id) {
        return scheduleRepository.findById(id)
                .map(this::convertToDTO);
    }

    public List<ScheduleDTO> getSchedulesByScriptId(Long scriptId) {
        return scheduleRepository.findByScriptId(scriptId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ScheduleDTO createSchedule(ScheduleDTO scheduleDTO) {
        // Validate script exists
        GeneratedScript script = generatedScriptRepository.findById(scheduleDTO.getScriptId())
                .orElseThrow(() -> new RuntimeException("Script not found with id: " + scheduleDTO.getScriptId()));

        // Check if schedule name already exists for this script
        if (scheduleRepository.existsByNameAndScriptId(scheduleDTO.getName(), scheduleDTO.getScriptId())) {
            throw new RuntimeException("Schedule with name '" + scheduleDTO.getName() + "' already exists for this script");
        }

        Schedule schedule = convertToEntity(scheduleDTO);

        // Calculate next execution
        schedule.setNextExecution(calculateNextExecution(schedule));

        Schedule saved = scheduleRepository.save(schedule);

        // Log schedule creation
        ScheduleHistory history = new ScheduleHistory(saved.getId(), null, saved.getStatus(), "Schedule created");
        scheduleHistoryRepository.save(history);

        return convertToDTO(saved);
    }

    public ScheduleDTO updateSchedule(Long id, ScheduleDTO scheduleDTO) {
        Schedule existingSchedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found with id: " + id));

        // Check if name already exists for other schedules with same script
        if (!existingSchedule.getName().equals(scheduleDTO.getName()) &&
                scheduleRepository.existsByNameAndScriptId(scheduleDTO.getName(), scheduleDTO.getScriptId())) {
            throw new RuntimeException("Schedule with name '" + scheduleDTO.getName() + "' already exists for this script");
        }

        ScheduleStatus oldStatus = existingSchedule.getStatus();

        existingSchedule.setName(scheduleDTO.getName());
        existingSchedule.setDescription(scheduleDTO.getDescription());
        existingSchedule.setFrequency(scheduleDTO.getFrequency());
        existingSchedule.setStatus(scheduleDTO.getStatus());
        existingSchedule.setStartDate(scheduleDTO.getStartDate());
        existingSchedule.setStartTime(scheduleDTO.getStartTime());
        existingSchedule.setDayOfWeek(scheduleDTO.getDayOfWeek());
        existingSchedule.setDayOfMonth(scheduleDTO.getDayOfMonth());

        // Recalculate next execution if schedule details changed
        existingSchedule.setNextExecution(calculateNextExecution(existingSchedule));

        Schedule updated = scheduleRepository.save(existingSchedule);

        // Log status change if it occurred
        if (!oldStatus.equals(scheduleDTO.getStatus())) {
            ScheduleHistory history = new ScheduleHistory(updated.getId(), oldStatus, updated.getStatus(), "Status updated via API");
            scheduleHistoryRepository.save(history);
        }

        return convertToDTO(updated);
    }

    public void deleteSchedule(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found with id: " + id));

        // Delete associated history
        scheduleHistoryRepository.deleteByScheduleId(id);

        scheduleRepository.deleteById(id);
    }

    public void activateSchedule(Long id) {
        updateScheduleStatus(id, ScheduleStatus.ACTIVE, "Activated manually");
    }

    public void deactivateSchedule(Long id) {
        updateScheduleStatus(id, ScheduleStatus.INACTIVE, "Deactivated manually");
    }

    private void updateScheduleStatus(Long id, ScheduleStatus newStatus, String reason) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found with id: " + id));

        ScheduleStatus oldStatus = schedule.getStatus();
        schedule.setStatus(newStatus);

        // Recalculate next execution if activating
        if (newStatus == ScheduleStatus.ACTIVE) {
            schedule.setNextExecution(calculateNextExecution(schedule));
        }

        scheduleRepository.save(schedule);

        // Log status change
        ScheduleHistory history = new ScheduleHistory(id, oldStatus, newStatus, reason);
        scheduleHistoryRepository.save(history);
    }

    public List<ScheduleHistoryDTO> getScheduleHistory(Long scheduleId) {
        return scheduleHistoryRepository.findByScheduleIdOrderByCreatedAtDesc(scheduleId).stream()
                .map(this::convertHistoryToDTO)
                .collect(Collectors.toList());
    }

    public List<ScheduleHistoryDTO> getExecutionHistory(Long scheduleId) {
        return scheduleHistoryRepository.findByScheduleIdAndTypeOrderByCreatedAtDesc(scheduleId, ScheduleHistoryType.EXECUTION).stream()
                .map(this::convertHistoryToDTO)
                .collect(Collectors.toList());
    }

    // Method called by scheduler to get schedules ready for execution
    public List<Schedule> getSchedulesToExecute() {
        return scheduleRepository.findSchedulesToExecute(LocalDateTime.now());
    }

    // Method called after test execution to update schedule
    public void recordExecution(Long scheduleId, TestStatus testStatus, Long executionTime, String output) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElse(null);

        if (schedule != null) {
            schedule.setLastExecution(LocalDateTime.now());
            schedule.setNextExecution(calculateNextExecution(schedule));
            scheduleRepository.save(schedule);

            // Record execution history
            ScheduleHistory history = new ScheduleHistory(scheduleId, testStatus, executionTime, output);
            scheduleHistoryRepository.save(history);
        }
    }

    private LocalDateTime calculateNextExecution(Schedule schedule) {
        LocalDateTime baseDateTime = LocalDateTime.of(schedule.getStartDate(), schedule.getStartTime());
        LocalDateTime now = LocalDateTime.now();

        // If start time is in the future, use it as next execution
        if (baseDateTime.isAfter(now)) {
            return baseDateTime;
        }

        switch (schedule.getFrequency()) {
            case DAILY:
                LocalDateTime nextDaily = baseDateTime;
                while (nextDaily.isBefore(now) || nextDaily.equals(now)) {
                    nextDaily = nextDaily.plusDays(1);
                }
                return nextDaily;

            case WEEKLY:
                if (schedule.getDayOfWeek() == null) {
                    throw new RuntimeException("Day of week must be specified for weekly schedules");
                }

                LocalDateTime nextWeekly = baseDateTime;
                while (nextWeekly.isBefore(now) || nextWeekly.equals(now)) {
                    nextWeekly = nextWeekly.plusWeeks(1);
                    // Adjust to correct day of week
                    int targetDayValue = schedule.getDayOfWeek().getDayNumber();
                    int currentDayValue = nextWeekly.getDayOfWeek().getValue();
                    int daysToAdd = (targetDayValue - currentDayValue + 7) % 7;
                    nextWeekly = nextWeekly.plusDays(daysToAdd);
                }
                return nextWeekly;

            case MONTHLY:
                if (schedule.getDayOfMonth() == null) {
                    throw new RuntimeException("Day of month must be specified for monthly schedules");
                }

                LocalDateTime nextMonthly = baseDateTime;
                while (nextMonthly.isBefore(now) || nextMonthly.equals(now)) {
                    nextMonthly = nextMonthly.plusMonths(1);
                    // Adjust day of month, handling month-end cases
                    int targetDay = Math.min(schedule.getDayOfMonth(), nextMonthly.toLocalDate().lengthOfMonth());
                    nextMonthly = nextMonthly.withDayOfMonth(targetDay);
                }
                return nextMonthly;

            default:
                throw new RuntimeException("Unsupported frequency: " + schedule.getFrequency());
        }
    }

    private ScheduleDTO convertToDTO(Schedule schedule) {
        ScheduleDTO dto = new ScheduleDTO();
        dto.setId(schedule.getId());
        dto.setScriptId(schedule.getScriptId());
        dto.setName(schedule.getName());
        dto.setDescription(schedule.getDescription());
        dto.setFrequency(schedule.getFrequency());
        dto.setStatus(schedule.getStatus());
        dto.setStartDate(schedule.getStartDate());
        dto.setStartTime(schedule.getStartTime());
        dto.setDayOfWeek(schedule.getDayOfWeek());
        dto.setDayOfMonth(schedule.getDayOfMonth());
        dto.setLastExecution(schedule.getLastExecution());
        dto.setNextExecution(schedule.getNextExecution());
        dto.setCreatedAt(schedule.getCreatedAt());
        dto.setUpdatedAt(schedule.getUpdatedAt());
        dto.setNotificationEmail(schedule.getNotificationEmail()); // ADD THIS LINE

        // Add additional info
        generatedScriptRepository.findById(schedule.getScriptId()).ifPresent(script -> {
            dto.setScriptFileName(script.getFileName());
            testcaseRepository.findById(script.getTestcaseId()).ifPresent(testcase -> {
                dto.setTestcaseName(testcase.getName());
            });
        });

        return dto;
    }


    private Schedule convertToEntity(ScheduleDTO dto) {
        Schedule schedule = new Schedule();
        schedule.setScriptId(dto.getScriptId());
        schedule.setName(dto.getName());
        schedule.setDescription(dto.getDescription());
        schedule.setFrequency(dto.getFrequency());
        schedule.setStatus(dto.getStatus());
        schedule.setStartDate(dto.getStartDate());
        schedule.setStartTime(dto.getStartTime());
        schedule.setDayOfWeek(dto.getDayOfWeek());
        schedule.setDayOfMonth(dto.getDayOfMonth());
        schedule.setNotificationEmail(dto.getNotificationEmail()); // ADD THIS LINE
        return schedule;
    }

    private ScheduleHistoryDTO convertHistoryToDTO(ScheduleHistory history) {
        ScheduleHistoryDTO dto = new ScheduleHistoryDTO();
        dto.setId(history.getId());
        dto.setScheduleId(history.getScheduleId());
        dto.setType(history.getType());
        dto.setTestStatus(history.getTestStatus());
        dto.setExecutionTime(history.getExecutionTime());
        dto.setTestOutput(history.getTestOutput());
        dto.setOldStatus(history.getOldStatus());
        dto.setNewStatus(history.getNewStatus());
        dto.setChangeReason(history.getChangeReason());
        dto.setCreatedAt(history.getCreatedAt());

        // Add schedule name
        scheduleRepository.findById(history.getScheduleId()).ifPresent(schedule -> {
            dto.setScheduleName(schedule.getName());
        });

        return dto;
    }
}