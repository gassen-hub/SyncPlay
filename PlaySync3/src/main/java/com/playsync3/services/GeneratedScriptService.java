package com.playsync3.services;

import com.playsync3.dto.GeneratedScriptDTO;
import com.playsync3.dto.TestcaseDTO;
import com.playsync3.entities.GeneratedScript;
import com.playsync3.entities.ScriptStatus;
import com.playsync3.repos.GeneratedScriptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Optional;

@Service
@Transactional
public class GeneratedScriptService {

    @Autowired
    private GeneratedScriptRepository generatedScriptRepository;

    @Autowired
    private TestcaseService testcaseService;

    @Autowired
    private LMStudioService lmStudioService;

    private static final String NODE_JS_BACKEND_PATH = "C:\\Users\\big97\\OneDrive\\Documents\\PFE\\playsync testingbackend";
    private static final String GENERATED_TESTS_DIR = NODE_JS_BACKEND_PATH + "\\generated-tests";

    public GeneratedScriptDTO generateScript(Long testcaseId) throws IOException {
        TestcaseDTO testcase = testcaseService.getTestcaseById(testcaseId)
                .orElseThrow(() -> new RuntimeException("Testcase not found with id: " + testcaseId));

        // Generate script using LM Studio
        String scriptContent = lmStudioService.generatePlaywrightScript(
                testcase.getName(),
                testcase.getDescription(),
                testcase.getSteps()
        );

        // Clean and format the script content
        scriptContent = cleanScriptContent(scriptContent);

        // FIXED: Change from .spec.ts to .spec.js to match Node.js service
        String fileName = testcase.getName().replaceAll("[^a-zA-Z0-9]", "_") + ".spec.js";

        // Save script to file
        saveScriptToFile(fileName, scriptContent);

        // Save or update in database
        Optional<GeneratedScript> existing = generatedScriptRepository.findByTestcaseId(testcaseId);
        GeneratedScript script;

        if (existing.isPresent()) {
            script = existing.get();
            script.setScriptContent(scriptContent);
            script.setFileName(fileName);
            script.setStatus(ScriptStatus.GENERATED);
        } else {
            script = new GeneratedScript(testcaseId, scriptContent, fileName, ScriptStatus.GENERATED);
        }

        GeneratedScript saved = generatedScriptRepository.save(script);
        return convertToDTO(saved);
    }

    public Optional<GeneratedScriptDTO> getScriptByTestcaseId(Long testcaseId) {
        return generatedScriptRepository.findByTestcaseId(testcaseId)
                .map(this::convertToDTO);
    }

    public Optional<GeneratedScriptDTO> getScriptById(Long id) {
        return generatedScriptRepository.findById(id)
                .map(this::convertToDTO);
    }

    private String cleanScriptContent(String scriptContent) {
        if (scriptContent == null || scriptContent.trim().isEmpty()) {
            return "// No script content generated";
        }

        // Remove markdown code blocks if present
        scriptContent = scriptContent.replaceAll("```typescript", "").replaceAll("```ts", "").replaceAll("```javascript", "").replaceAll("```js", "").replaceAll("```", "");

        // FIXED: Convert TypeScript imports to CommonJS requires for .js files
        if (scriptContent.contains("import") && !scriptContent.contains("require")) {
            scriptContent = scriptContent.replaceAll("import\\s*\\{([^}]+)\\}\\s*from\\s*['\"]@playwright/test['\"];?",
                    "const { $1 } = require('@playwright/test');");
        }

        // If no imports found, add the default require
        if (!scriptContent.contains("import") && !scriptContent.contains("require")) {
            scriptContent = "const { test, expect } = require('@playwright/test');\n\n" + scriptContent;
        }

        // Remove any duplicate requires
        scriptContent = scriptContent.replaceAll("(const.*require.*@playwright/test.*\\s*)+",
                "const { test, expect } = require('@playwright/test');\n");

        return scriptContent.trim();
    }

    private void saveScriptToFile(String fileName, String content) throws IOException {
        // Create generated-tests directory if it doesn't exist
        Path generatedTestsPath = Paths.get(GENERATED_TESTS_DIR);
        if (!Files.exists(generatedTestsPath)) {
            Files.createDirectories(generatedTestsPath);
        }

        Path filePath = generatedTestsPath.resolve(fileName);
        Files.write(filePath, content.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

        System.out.println("Script saved to: " + filePath.toString());
        System.out.println("Script content preview: " + content.substring(0, Math.min(200, content.length())) + "...");
    }

    private GeneratedScriptDTO convertToDTO(GeneratedScript script) {
        GeneratedScriptDTO dto = new GeneratedScriptDTO();
        dto.setId(script.getId());
        dto.setTestcaseId(script.getTestcaseId());
        dto.setScriptContent(script.getScriptContent());
        dto.setFileName(script.getFileName());
        dto.setStatus(script.getStatus());
        dto.setCreatedAt(script.getCreatedAt());
        return dto;
    }
}