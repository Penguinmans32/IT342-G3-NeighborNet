package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.CreateClassRequest;
import com.example.neighbornetbackend.dto.ClassResponse;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.ClassService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;


import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin
public class ClassController {
    private final ClassService classService;

    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    @Operation(summary = "Create a new class")
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<ClassResponse> createClass(
            @RequestPart("thumbnail") MultipartFile thumbnail,
            @RequestPart("classData") CreateClassRequest request,
            @CurrentUser UserPrincipal currentUser) {
        try {
            // Add debug logging
            System.out.println("Received thumbnail: " + thumbnail.getOriginalFilename());
            System.out.println("Received classData: " + request);
            System.out.println("Current user: " + currentUser.getId());

            ClassResponse newClass = classService.createClass(request, thumbnail, currentUser.getId());
            return ResponseEntity.ok(newClass);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/my-classes")
    public ResponseEntity<List<ClassResponse>> getMyClasses(@CurrentUser UserPrincipal currentUser) {
        List<ClassResponse> classes = classService.getClassesByUser(currentUser.getId());
        return ResponseEntity.ok(classes);
    }


    @GetMapping("/thumbnail/{filename:.+}")
    public ResponseEntity<Resource> getThumbnail(@PathVariable String filename) {
        try {
            Path file = Paths.get("thumbnails").resolve(filename).toAbsolutePath();

            Resource resource = new UrlResource(file.toUri());
            System.out.println("Resource exists: " + resource.exists());
            System.out.println("Resource is readable: " + resource.isReadable());

            if (resource.exists() && resource.isReadable()) {
                // Determine content type based on file extension
                String contentType = determineContentType(filename);
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error serving thumbnail: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    private String determineContentType(String filename) {
        if (filename.toLowerCase().endsWith(".png")) {
            return "image/png";
        } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
            return "image/jpeg";
        }
        return "image/jpeg"; // default
    }

    @GetMapping("/{classId}")
    public ResponseEntity<ClassResponse> getClass(@PathVariable Long classId) {
        try {
            ClassResponse classResponse = classService.getClassById(classId);
            return ResponseEntity.ok(classResponse);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<ClassResponse>> getAllClasses() {
        try {
            List<ClassResponse> classes = classService.getAllClasses();
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}