package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.service.FileProcessingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin
public class FileUploadController {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);
    private final FileProcessingService fileProcessingService;

    @Autowired
    public FileUploadController(FileProcessingService fileProcessingService) {
        this.fileProcessingService = fileProcessingService;
    }

    @PostMapping("/extract-text")
    public ResponseEntity<Map<String, String>> extractTextFromFile(@RequestParam("file") MultipartFile file) {
        logger.info("Received file to extract text: {}, size: {} bytes",
                file.getOriginalFilename(), file.getSize());

        Map<String, String> response = new HashMap<>();

        try {
            String extractedText = fileProcessingService.extractTextFromFile(file);

            if (extractedText.length() > 50000) {
                extractedText = extractedText.substring(0, 50000) +
                        "\n\n[Content truncated due to size. Processed " +
                        file.getSize() + " bytes in total]";
            }

            response.put("content", extractedText);
            response.put("filename", file.getOriginalFilename());
            response.put("status", "success");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing file upload", e);
            response.put("status", "error");
            response.put("message", "Failed to process file: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}