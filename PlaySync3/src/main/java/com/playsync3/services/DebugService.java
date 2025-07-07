package com.playsync3.services;

import com.playsync3.dto.DebugMessageDTO;
import com.playsync3.dto.GeneratedScriptDTO;
import com.playsync3.entities.DebugSession;
import com.playsync3.entities.DebugStatus;
import com.playsync3.repos.DebugSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class DebugService {

    @Autowired
    private DebugSessionRepository debugSessionRepository;

    @Autowired
    private GeneratedScriptService generatedScriptService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Value("${playwright.service.url:http://localhost:3001}")
    private String playwrightServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String startDebugSession(Long testcaseId, String userSession) {
        // Get the generated script for this testcase
        GeneratedScriptDTO script = generatedScriptService.getScriptByTestcaseId(testcaseId)
                .orElseThrow(() -> new RuntimeException("No generated script found for testcase: " + testcaseId));

        // Generate unique session ID
        String sessionId = UUID.randomUUID().toString();

        // Create debug session
        DebugSession debugSession = new DebugSession(testcaseId, script.getId(), sessionId, userSession);
        debugSessionRepository.save(debugSession);

        // Send initial status message
        sendDebugMessage(sessionId, testcaseId, "Debug session started", "INFO", "STATUS");

        // Start the debug execution asynchronously
        CompletableFuture.runAsync(() -> executeDebugTest(sessionId, script));

        return sessionId;
    }

    public void stopDebugSession(String sessionId) {
        Optional<DebugSession> sessionOpt = debugSessionRepository.findBySessionId(sessionId);
        if (sessionOpt.isPresent()) {
            DebugSession session = sessionOpt.get();
            session.setStatus(DebugStatus.STOPPED);
            session.setEndedAt(LocalDateTime.now());
            debugSessionRepository.save(session);

            // Send stop command to Node.js service
            try {
                Map<String, Object> stopRequest = new HashMap<>();
                stopRequest.put("action", "stop");
                stopRequest.put("sessionId", sessionId);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> request = new HttpEntity<>(stopRequest, headers);

                ResponseEntity<Map> response = restTemplate.postForEntity(playwrightServiceUrl + "/debug/stop", request, Map.class);
                System.out.println("Stop command sent to Node.js service: " + response.getStatusCode());
            } catch (Exception e) {
                System.err.println("Failed to stop debug session: " + e.getMessage());
            }

            sendDebugMessage(sessionId, session.getTestcaseId(), "Debug session stopped", "INFO", "STATUS");
        }
    }

    private void executeDebugTest(String sessionId, GeneratedScriptDTO script) {
        try {
            // Update session status
            updateSessionStatus(sessionId, DebugStatus.RUNNING);

            // Send execution start message
            sendDebugMessage(sessionId, script.getTestcaseId(), "Starting test execution in debug mode", "INFO", "STATUS");

            // Prepare debug request with callback URL
            Map<String, Object> debugRequest = new HashMap<>();
            debugRequest.put("fileName", script.getFileName());
            debugRequest.put("sessionId", sessionId);
            debugRequest.put("testcaseId", script.getTestcaseId());
            debugRequest.put("mode", "debug");
            debugRequest.put("callbackUrl", "http://localhost:8075/api/debug/message"); // Add callback URL

            System.out.println("Starting debug execution for: " + script.getFileName());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(debugRequest, headers);

            // Call the debug endpoint on Node.js service
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    playwrightServiceUrl + "/debug/execute",
                    request,
                    Map.class
            );

            // Handle response
            if (response.getBody() != null) {
                Boolean success = (Boolean) response.getBody().get("success");
                String message = (String) response.getBody().get("message");

                if (success) {
                    sendDebugMessage(sessionId, script.getTestcaseId(), "Debug execution started successfully", "INFO", "STATUS");
                } else {
                    updateSessionStatus(sessionId, DebugStatus.FAILED);
                    sendDebugMessage(sessionId, script.getTestcaseId(), "Failed to start debug execution: " + message, "ERROR", "STATUS");
                }
            }

        } catch (Exception e) {
            System.err.println("Debug execution failed: " + e.getMessage());
            updateSessionStatus(sessionId, DebugStatus.FAILED);
            sendDebugMessage(sessionId, script.getTestcaseId(), "Debug execution failed: " + e.getMessage(), "ERROR", "STATUS");
        }
    }

    public void handleDebugMessage(String sessionId, String message, String level, String type) {
        // This method will be called by the WebSocket controller when receiving messages from Node.js
        Optional<DebugSession> sessionOpt = debugSessionRepository.findBySessionId(sessionId);
        if (sessionOpt.isPresent()) {
            DebugSession session = sessionOpt.get();
            sendDebugMessage(sessionId, session.getTestcaseId(), message, level, type);
        }
    }

    private void sendDebugMessage(String sessionId, Long testcaseId, String message, String level, String type) {
        DebugMessageDTO debugMessage = new DebugMessageDTO(type, sessionId, testcaseId, message, level);

        // Send to specific session topic
        messagingTemplate.convertAndSend("/topic/debug/" + sessionId, debugMessage);

        System.out.println("Debug message sent - Session: " + sessionId + ", Message: " + message);
    }

    private void updateSessionStatus(String sessionId, DebugStatus status) {
        Optional<DebugSession> sessionOpt = debugSessionRepository.findBySessionId(sessionId);
        if (sessionOpt.isPresent()) {
            DebugSession session = sessionOpt.get();
            session.setStatus(status);
            if (status == DebugStatus.COMPLETED || status == DebugStatus.FAILED || status == DebugStatus.STOPPED) {
                session.setEndedAt(LocalDateTime.now());
            }
            debugSessionRepository.save(session);
        }
    }

    public Optional<DebugSession> getDebugSession(String sessionId) {
        return debugSessionRepository.findBySessionId(sessionId);
    }
}
