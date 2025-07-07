package com.playsync3.controller;

import com.playsync3.dto.ScheduleDTO;
import com.playsync3.dto.ScheduleHistoryDTO;
import com.playsync3.services.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "*")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<List<ScheduleDTO>> getAllSchedules() {
        List<ScheduleDTO> schedules = scheduleService.getAllSchedules();
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScheduleDTO> getScheduleById(@PathVariable Long id) {
        return scheduleService.getScheduleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/script/{scriptId}")
    public ResponseEntity<List<ScheduleDTO>> getSchedulesByScriptId(@PathVariable Long scriptId) {
        List<ScheduleDTO> schedules = scheduleService.getSchedulesByScriptId(scriptId);
        return ResponseEntity.ok(schedules);
    }

    @PostMapping
    public ResponseEntity<?> createSchedule(@Valid @RequestBody ScheduleDTO scheduleDTO) {
        try {
            ScheduleDTO created = scheduleService.createSchedule(scheduleDTO);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSchedule(@PathVariable Long id, @Valid @RequestBody ScheduleDTO scheduleDTO) {
        try {
            ScheduleDTO updated = scheduleService.updateSchedule(id, scheduleDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        try {
            scheduleService.deleteSchedule(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activateSchedule(@PathVariable Long id) {
        try {
            scheduleService.activateSchedule(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Schedule activated successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateSchedule(@PathVariable Long id) {
        try {
            scheduleService.deactivateSchedule(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Schedule deactivated successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ScheduleHistoryDTO>> getScheduleHistory(@PathVariable Long id) {
        List<ScheduleHistoryDTO> history = scheduleService.getScheduleHistory(id);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}/executions")
    public ResponseEntity<List<ScheduleHistoryDTO>> getExecutionHistory(@PathVariable Long id) {
        List<ScheduleHistoryDTO> executions = scheduleService.getExecutionHistory(id);
        return ResponseEntity.ok(executions);
    }
}