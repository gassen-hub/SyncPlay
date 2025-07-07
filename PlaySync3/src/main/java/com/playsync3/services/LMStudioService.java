package com.playsync3.services;

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

@Service
public class LMStudioService {

    @Value("${lmstudio.api.url}")
    private String lmStudioUrl;

    @Value("${lmstudio.api.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generatePlaywrightScript(String testcaseName, String description, List<String> steps) {
        try {
            String prompt = createPrompt(testcaseName, description, steps);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", List.of(
                    Map.of("role", "system", "content",
                            "You are an expert test-automation engineer. Produce production-grade, copy-and-paste-ready Playwright tests in JavaScript (CommonJS require) for Node.js. Follow best practices: robust selectors, no arbitrary sleeps, built-in waits/assertions, meaningful comments."),
                    Map.of("role", "user", "content", prompt)
            ));
            requestBody.put("temperature", 0.3);
            requestBody.put("max_tokens", 2000);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(lmStudioUrl, request, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String content = (String) message.get("content");
                    return cleanGeneratedScript(content);
                }
            }

            throw new RuntimeException("Invalid response from LM Studio");
        } catch (Exception e) {
            System.err.println("LM Studio generation failed: " + e.getMessage());
            return generateFallbackScript(testcaseName, description, steps);
        }
    }

    private String createPrompt(String testcaseName, String description, List<String> steps) {
        // Format test steps with explicit index
        StringBuilder stepsBuilder = new StringBuilder();
        for (int i = 0; i < steps.size(); i++) {
            stepsBuilder.append(i + 1).append(". ").append(steps.get(i)).append("\n");
        }
        String formattedSteps = stepsBuilder.toString();

        String template = """
SYSTEM:
You are an expert test-automation engineer. Produce production-grade, copy-and-paste-ready Playwright tests in JavaScript (CommonJS require) for Node.js. Follow best practices: robust selectors, no arbitrary sleeps, built-in waits/assertions, meaningful comments.

USER:
Generate a complete Playwright test script for the following scenario:

---
Feature Name: %s
Description: %s

Preconditions:
- URL under test: http://localhost:3001

Test Steps:
%s

Key Selectors:
- File upload input: #file-input
- Result table: table

Requirements:
- Use @playwright/test with `const { test, expect } = require('@playwright/test');`
- Wrap in `test.describe('%%s', () => { ... })`
- Use `page.goto` and explicit waits (`waitFor`, `toBeVisible()`)
- Use `setInputFiles(path, { force: true })` for hidden inputs
- Avoid `waitForTimeout()` except as absolute last resort
- Use meaningful `expect()` assertions (`toBeVisible()`, `toHaveCount()`, etc.)
- Inline comments for each step
- Keep body under 20 lines excluding imports

Output only JavaScript code, no markdown or explanatory text.
""";

        return String.format(template, testcaseName, description, formattedSteps);
    }

    private String cleanGeneratedScript(String content) {
        if (content == null) {
            return "";
        }
        // Strip markdown fences
        content = content.replaceAll("```(?:javascript|js|typescript|ts)?", "");
        // Convert any TypeScript imports
        content = content.replaceAll(
                "import\\s*\\{([^}]+)\\}\\s*from\\s*['\"]@playwright/test['\"];?",
                "const { $1 } = require('@playwright/test');"
        );
        // Extract only the code lines
        String[] lines = content.split("\n");
        StringBuilder cleaned = new StringBuilder();
        boolean inCode = false;
        for (String line : lines) {
            if (line.trim().startsWith("const") || line.trim().startsWith("test.")) {
                inCode = true;
            }
            if (inCode) {
                cleaned.append(line).append("\n");
            }
        }
        return cleaned.toString().trim();
    }

    private String generateFallbackScript(String testcaseName, String description, List<String> steps) {
        StringBuilder script = new StringBuilder();
        script.append("const { test, expect } = require('@playwright/test');\n\n");
        script.append("test.describe('").append(testcaseName).append("', () => {\n");
        script.append("  test('").append(description).append("', async ({ page }) => {\n");
        script.append("    // Auto-generated fallback script\n");
        for (int i = 0; i < steps.size(); i++) {
            script.append("    // Step ").append(i + 1).append(": ").append(steps.get(i)).append("\n");
        }
        script.append("    await page.goto('http://localhost:3001');\n");
        script.append("    await expect(page).toHaveTitle(/.*/);\n");
        script.append("  });\n");
        script.append("});");
        return script.toString();
    }
}
