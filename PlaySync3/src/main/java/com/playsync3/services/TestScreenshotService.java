package com.playsync3.services;

import com.playsync3.dto.TestScreenshotDTO;
import com.playsync3.entities.TestScreenshot;
import com.playsync3.entities.ScreenshotType;
import com.playsync3.repos.TestScreenshotRepository;
import com.playsync3.repos.GeneratedScriptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TestScreenshotService {

    @Autowired
    private TestScreenshotRepository testScreenshotRepository;

    @Autowired
    private GeneratedScriptRepository generatedScriptRepository;

    private static final String SCREENSHOTS_DIR = "C:\\Users\\big97\\OneDrive\\Documents\\PFE\\playsync testingbackend\\screenshots";

    public List<TestScreenshotDTO> getScreenshotsByTestResultId(Long testResultId) {
        return testScreenshotRepository.findByTestResultIdOrderByCreatedAtDesc(testResultId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TestScreenshotDTO> getScreenshotsByTestCaseId(Long testcaseId) {
        // Get all script IDs for this test case
        List<Long> scriptIds = generatedScriptRepository.findByTestcaseId(testcaseId)
                .stream()
                .map(script -> script.getId())
                .collect(Collectors.toList());

        if (scriptIds.isEmpty()) {
            return List.of();
        }

        // Get all screenshots for these scripts
        return testScreenshotRepository.findByScriptIds(scriptIds)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TestScreenshotDTO saveScreenshot(Long testResultId, String filePath, String fileName,
                                            ScreenshotType screenshotType, String stepName) {
        TestScreenshot screenshot = new TestScreenshot(testResultId, filePath, fileName, screenshotType, stepName);
        TestScreenshot saved = testScreenshotRepository.save(screenshot);
        return convertToDTO(saved);
    }

    public Resource getScreenshotResource(String fileName) throws MalformedURLException {
        Path filePath = Paths.get(SCREENSHOTS_DIR).resolve(fileName);
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("Could not read screenshot file: " + fileName);
        }
    }

    private TestScreenshotDTO convertToDTO(TestScreenshot screenshot) {
        TestScreenshotDTO dto = new TestScreenshotDTO();
        dto.setId(screenshot.getId());
        dto.setTestResultId(screenshot.getTestResultId());
        dto.setFilePath(screenshot.getFilePath());
        dto.setFileName(screenshot.getFileName());
        dto.setScreenshotType(screenshot.getScreenshotType());
        dto.setStepName(screenshot.getStepName());
        dto.setCreatedAt(screenshot.getCreatedAt());
        return dto;
    }
}
