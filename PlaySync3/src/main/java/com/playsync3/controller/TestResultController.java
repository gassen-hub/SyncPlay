package com.playsync3.controller;

import com.playsync3.dto.TestResultDTO;
import com.playsync3.services.PlaywrightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "*")
public class TestResultController {

    @Autowired
    private PlaywrightService playwrightService;

    @GetMapping("/script/{scriptId}")
    public ResponseEntity<List<TestResultDTO>> getResultsByScriptId(@PathVariable Long scriptId) {
        List<TestResultDTO> results = playwrightService.getResultsByScriptId(scriptId);
        return ResponseEntity.ok(results);
    }
}



