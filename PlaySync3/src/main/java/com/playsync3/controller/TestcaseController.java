package com.playsync3.controller;

import com.playsync3.dto.TestcaseDTO;
import com.playsync3.services.TestcaseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Resource;
import jakarta.validation.Path;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@RestController
@RequestMapping("/api/testcases")
@CrossOrigin(origins = "*")
public class TestcaseController {

    @Autowired
    private TestcaseService testcaseService;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<List<TestcaseDTO>> getAllTestcases() {
        List<TestcaseDTO> testcases = testcaseService.getAllTestcases();
        return ResponseEntity.ok(testcases);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestcaseDTO> getTestcaseById(@PathVariable Long id) {
        return testcaseService.getTestcaseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TestcaseDTO> createTestcase(
            @RequestParam("testcase") String testcaseJson,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            TestcaseDTO testcaseDTO = objectMapper.readValue(testcaseJson, TestcaseDTO.class);
            TestcaseDTO created = testcaseService.createTestcase(testcaseDTO, file);
            return ResponseEntity.ok(created);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestcaseDTO> updateTestcase(
            @PathVariable Long id,
            @RequestParam("testcase") String testcaseJson,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            TestcaseDTO testcaseDTO = objectMapper.readValue(testcaseJson, TestcaseDTO.class);
            TestcaseDTO updated = testcaseService.updateTestcase(id, testcaseDTO, file);
            return ResponseEntity.ok(updated);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestcase(@PathVariable Long id) {
        try {
            testcaseService.deleteTestcase(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
