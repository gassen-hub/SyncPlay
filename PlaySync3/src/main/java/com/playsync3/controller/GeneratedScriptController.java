package com.playsync3.controller;

import com.playsync3.dto.GeneratedScriptDTO;
import com.playsync3.dto.TestResultDTO;
import com.playsync3.services.GeneratedScriptService;
import com.playsync3.services.PlaywrightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/testcases")
@CrossOrigin(origins = "*")
public class GeneratedScriptController {

    @Autowired
    private GeneratedScriptService generatedScriptService;

    @Autowired
    private PlaywrightService playwrightService;

    @PostMapping("/{testcaseId}/generate-script")
    public ResponseEntity<GeneratedScriptDTO> generateScript(@PathVariable Long testcaseId) {
        try {
            GeneratedScriptDTO script = generatedScriptService.generateScript(testcaseId);
            return ResponseEntity.ok(script);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{testcaseId}/execute")
    public ResponseEntity<?> executeTestByTestcaseId(@PathVariable Long testcaseId) {
        try {
            // 1. Find the generated script for this testcase
            GeneratedScriptDTO script = generatedScriptService.getScriptByTestcaseId(testcaseId)
                    .orElseThrow(() -> new RuntimeException("No generated script found for testcase: " + testcaseId));

            // 2. Execute the test using the complete script object
            TestResultDTO result = playwrightService.executeTest(script);
            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{testcaseId}/script")
    public ResponseEntity<GeneratedScriptDTO> getScriptByTestcaseId(@PathVariable Long testcaseId) {
        return generatedScriptService.getScriptByTestcaseId(testcaseId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{testcaseId}/execute-debug")
    public ResponseEntity<?> executeTestInDebugMode(@PathVariable Long testcaseId) {
        try {
            // 1. Find the generated script for this testcase
            GeneratedScriptDTO script = generatedScriptService.getScriptByTestcaseId(testcaseId)
                    .orElseThrow(() -> new RuntimeException("No generated script found for testcase: " + testcaseId));

            // 2. Execute the test in debug mode using the complete script object
            Map<String, Object> debugResult = playwrightService.executeTestInDebugMode(script);
            return ResponseEntity.ok(debugResult);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/debug-session/{sessionId}/status")
    public ResponseEntity<?> getDebugSessionStatus(@PathVariable String sessionId) {
        try {
            Map<String, Object> status = playwrightService.getDebugSessionStatus(sessionId);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }


}