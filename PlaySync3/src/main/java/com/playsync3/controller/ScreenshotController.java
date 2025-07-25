package com.playsync3.controller;

import com.playsync3.dto.TestScreenshotDTO;
import com.playsync3.services.TestScreenshotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.util.List;

@RestController
@RequestMapping("/api/screenshots")
@CrossOrigin(origins = "*")
public class ScreenshotController {

    @Autowired
    private TestScreenshotService testScreenshotService;

    @GetMapping("/result/{resultId}")
    public ResponseEntity<List<TestScreenshotDTO>> getScreenshotsByResultId(@PathVariable Long resultId) {
        List<TestScreenshotDTO> screenshots = testScreenshotService.getScreenshotsByTestResultId(resultId);
        return ResponseEntity.ok(screenshots);
    }

    @GetMapping("/testcase/{testcaseId}")
    public ResponseEntity<List<TestScreenshotDTO>> getScreenshotsByTestCaseId(@PathVariable Long testcaseId) {
        List<TestScreenshotDTO> screenshots = testScreenshotService.getScreenshotsByTestCaseId(testcaseId);
        return ResponseEntity.ok(screenshots);
    }

    @GetMapping("/file/{fileName:.+}")
    public ResponseEntity<Resource> getScreenshotFile(@PathVariable String fileName) {
        try {
            Resource resource = testScreenshotService.getScreenshotResource(fileName);

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
