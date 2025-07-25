package com.playsync3.services;

import com.playsync3.dto.TestcaseDTO;
import com.playsync3.entities.Testcase;
import com.playsync3.repos.TestcaseRepository;
import com.playsync3.repos.GeneratedScriptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TestcaseService {

    @Autowired
    private TestcaseRepository testcaseRepository;

    @Autowired
    private GeneratedScriptRepository generatedScriptRepository;

    private static final String NODE_JS_BACKEND_PATH = "C:\\Users\\big97\\OneDrive\\Documents\\PFE\\SyncPlay\\playsync testingbackend";
    private static final String TEST_FILES_DIR = NODE_JS_BACKEND_PATH + "\\test-files";

    public List<TestcaseDTO> getAllTestcases() {
        return testcaseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<TestcaseDTO> getTestcaseById(Long id) {
        return testcaseRepository.findById(id)
                .map(this::convertToDTO);
    }

    public TestcaseDTO createTestcase(TestcaseDTO testcaseDTO, MultipartFile file) throws IOException {
        // Check if name already exists
        if (testcaseRepository.existsByName(testcaseDTO.getName())) {
            throw new RuntimeException("Testcase with name '" + testcaseDTO.getName() + "' already exists");
        }

        Testcase testcase = convertToEntity(testcaseDTO);

        // Handle file upload if present
        if (file != null && !file.isEmpty()) {
            String fileName = saveFile(file);
            testcase.setUploadedFileName(fileName);
        }

        Testcase saved = testcaseRepository.save(testcase);
        return convertToDTO(saved);
    }

    public TestcaseDTO updateTestcase(Long id, TestcaseDTO testcaseDTO, MultipartFile file) throws IOException {
        Testcase existingTestcase = testcaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Testcase not found with id: " + id));

        // Check if name already exists for other testcases
        if (!existingTestcase.getName().equals(testcaseDTO.getName()) &&
                testcaseRepository.existsByName(testcaseDTO.getName())) {
            throw new RuntimeException("Testcase with name '" + testcaseDTO.getName() + "' already exists");
        }

        existingTestcase.setName(testcaseDTO.getName());
        existingTestcase.setDescription(testcaseDTO.getDescription());
        existingTestcase.setSteps(testcaseDTO.getSteps());

        // Handle file upload if present
        if (file != null && !file.isEmpty()) {
            // Delete old file if exists
            if (existingTestcase.getUploadedFileName() != null) {
                deleteFile(existingTestcase.getUploadedFileName());
            }
            String fileName = saveFile(file);
            existingTestcase.setUploadedFileName(fileName);
        }

        Testcase updated = testcaseRepository.save(existingTestcase);
        return convertToDTO(updated);
    }

    public void deleteTestcase(Long id) {
        Testcase testcase = testcaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Testcase not found with id: " + id));

        // Delete associated file if exists
        if (testcase.getUploadedFileName() != null) {
            deleteFile(testcase.getUploadedFileName());
        }

        // Delete associated generated script
        generatedScriptRepository.deleteByTestcaseId(id);

        testcaseRepository.deleteById(id);
    }

    private String saveFile(MultipartFile file) throws IOException {
        // Create test-files directory if it doesn't exist
        Path testFilesPath = Paths.get(TEST_FILES_DIR);
        if (!Files.exists(testFilesPath)) {
            Files.createDirectories(testFilesPath);
        }

        String fileName = file.getOriginalFilename();
        Path filePath = testFilesPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return fileName;
    }

    private void deleteFile(String fileName) {
        try {
            Path filePath = Paths.get(TEST_FILES_DIR, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log error but don't throw exception
            System.err.println("Failed to delete file: " + fileName);
        }
    }

    private TestcaseDTO convertToDTO(Testcase testcase) {
        TestcaseDTO dto = new TestcaseDTO();
        dto.setId(testcase.getId());
        dto.setName(testcase.getName());
        dto.setDescription(testcase.getDescription());
        dto.setSteps(testcase.getSteps());
        dto.setUploadedFileName(testcase.getUploadedFileName());
        dto.setCreatedAt(testcase.getCreatedAt());
        dto.setUpdatedAt(testcase.getUpdatedAt());
        return dto;
    }

    private Testcase convertToEntity(TestcaseDTO dto) {
        Testcase testcase = new Testcase();
        testcase.setName(dto.getName());
        testcase.setDescription(dto.getDescription());
        testcase.setSteps(dto.getSteps());
        return testcase;
    }}