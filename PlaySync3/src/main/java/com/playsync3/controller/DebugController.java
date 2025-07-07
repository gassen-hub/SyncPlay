package com.playsync3.controller;

import com.playsync3.dto.DebugMessageDTO;
import com.playsync3.entities.DebugSession;
import com.playsync3.services.DebugService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class DebugController {

    @Autowired
    private DebugService debugService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/start/{testcaseId}")
    public ResponseEntity<Map<String, String>> startDebugSession(
            @PathVariable Long testcaseId,
            @RequestParam(value = "userSession", required = false, defaultValue = "default") String userSession) {

        try {
            String sessionId = debugService.startDebugSession(testcaseId, userSession);

            Map<String, String> response = new HashMap<>();
            response.put("sessionId", sessionId);
            response.put("message", "Debug session started successfully");
            response.put("websocketTopic", "/topic/debug/" + sessionId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/stop/{sessionId}")
    public ResponseEntity<Map<String, String>> stopDebugSession(@PathVariable String sessionId) {
        try {
            debugService.stopDebugSession(sessionId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Debug session stopped successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<DebugSession> getDebugSession(@PathVariable String sessionId) {
        Optional<DebugSession> session = debugService.getDebugSession(sessionId);
        return session.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Fixed WebSocket endpoint for receiving debug messages from Node.js service
    @PostMapping("/message")
    public ResponseEntity<Void> receiveDebugMessage(@RequestBody DebugMessageDTO message) {
        System.out.println("Received debug message: " + message.getMessage() + " for session: " + message.getSessionId());

        // Forward the message to WebSocket subscribers
        messagingTemplate.convertAndSend("/topic/debug/" + message.getSessionId(), message);
        return ResponseEntity.ok().build();
    }

    // WebSocket message handling for client interactions
    @MessageMapping("/debug/subscribe")
    public void subscribeToDebugSession(@Payload Map<String, String> payload) {
        String sessionId = payload.get("sessionId");
        System.out.println("Client subscribed to debug session: " + sessionId);

        // Send confirmation message
        DebugMessageDTO confirmMessage = new DebugMessageDTO(
                "STATUS", sessionId, null, "Successfully subscribed to debug session", "INFO"
        );
        messagingTemplate.convertAndSend("/topic/debug/" + sessionId, confirmMessage);
    }

    // Additional endpoint to check WebSocket connectivity
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("websocket", "available");
        return ResponseEntity.ok(response);
    }
}