package com.playsync3.services;

import com.playsync3.dto.GeneratedScriptDTO;
import com.playsync3.dto.TestResultDTO;
import com.playsync3.entities.TestResult;
import com.playsync3.entities.TestStatus;
import com.playsync3.repos.TestResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PlaywrightService {

    @Autowired
    private TestResultRepository testResultRepository;

    @Value("${playwright.service.url}")
    private String playwrightServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public TestResultDTO executeTest(GeneratedScriptDTO script) {
        long startTime = System.currentTimeMillis();

        try {
            // Prepare request body - send fileName instead of script content
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("fileName", script.getFileName()); // Send the existing file name
            requestBody.put("testName", script.getFileName().replace(".spec.js", "").replace(".spec.js", "")); // Handle both extensions
            requestBody.put("testId", script.getTestcaseId());

            System.out.println("Executing test with fileName: " + script.getFileName());
            System.out.println("Request body: " + requestBody);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    playwrightServiceUrl + "/execute-existing-test", // Updated endpoint
                    request,
                    Map.class
            );

            long executionTime = System.currentTimeMillis() - startTime;

            TestStatus status;
            String output;

            if (response.getBody() != null) {
                Boolean success = (Boolean) response.getBody().get("success");
                String message = (String) response.getBody().get("message");
                String responseOutput = (String) response.getBody().get("output");

                status = success ? TestStatus.PASSED : TestStatus.FAILED;
                output = message + "\n\n" + (responseOutput != null ? responseOutput : "");

                System.out.println("Test execution result: success=" + success + ", message=" + message);
            } else {
                status = TestStatus.FAILED;
                output = "No response from Playwright service";
            }

            TestResult result = new TestResult(script.getId(), status, output, executionTime);
            TestResult saved = testResultRepository.save(result);
            return convertToDTO(saved);

        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            String errorMessage = "Execution failed: " + e.getMessage();
            System.err.println("PlaywrightService error: " + errorMessage);
            e.printStackTrace();

            TestResult result = new TestResult(script.getId(), TestStatus.FAILED, errorMessage, executionTime);
            TestResult saved = testResultRepository.save(result);
            return convertToDTO(saved);
        }
    }

    public List<TestResultDTO> getResultsByScriptId(Long scriptId) {
        return testResultRepository.findByScriptIdOrderByCreatedAtDesc(scriptId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private TestResultDTO convertToDTO(TestResult result) {
        TestResultDTO dto = new TestResultDTO();
        dto.setId(result.getId());
        dto.setScriptId(result.getScriptId());
        dto.setStatus(result.getStatus());
        dto.setOutput(result.getOutput());
        dto.setExecutionTime(result.getExecutionTime());
        dto.setCreatedAt(result.getCreatedAt());
        return dto;
    }
    public Map<String, Object> executeTestInDebugMode(GeneratedScriptDTO script) {
        try {
            // Prepare request body for debug execution
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("fileName", script.getFileName());
            requestBody.put("testName", script.getFileName().replace(".spec.js", ""));
            requestBody.put("testId", script.getTestcaseId());
            requestBody.put("debugMode", true);

            System.out.println("Starting debug execution for: " + script.getFileName());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    playwrightServiceUrl + "/execute-debug-test",
                    request,
                    Map.class
            );

            if (response.getBody() != null) {
                return response.getBody();
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "No response from Playwright service");
                return errorResponse;
            }

        } catch (Exception e) {
            System.err.println("Debug execution error: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Debug execution failed: " + e.getMessage());
            return errorResponse;
        }
    }

    public Map<String, Object> getDebugSessionStatus(String sessionId) {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    playwrightServiceUrl + "/debug-session/" + sessionId + "/status",
                    Map.class
            );

            return response.getBody() != null ? response.getBody() : new HashMap<>();
        } catch (Exception e) {
            System.err.println("Error getting debug session status: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return errorResponse;
        }
    }
}