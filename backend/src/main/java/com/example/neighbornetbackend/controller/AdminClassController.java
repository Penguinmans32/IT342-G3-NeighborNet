package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.ApiResponse;
import com.example.neighbornetbackend.dto.ClassResponse;
import com.example.neighbornetbackend.model.CourseClass;
import com.example.neighbornetbackend.repository.ClassRepository;
import com.example.neighbornetbackend.service.AdminClassService;
import com.example.neighbornetbackend.service.ClassService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/classes")
@CrossOrigin
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminClassController {
    private final ClassRepository classRepository;
    private final ClassService classService;
    private final AdminClassService adminClassService;

    public AdminClassController(ClassRepository classRepository, ClassService classService, AdminClassService adminClassService) {
        this.classRepository = classRepository;
        this.classService = classService;
        this.adminClassService = adminClassService;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getClassStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            long totalClasses = classRepository.count();
            stats.put("totalClasses", totalClasses);

            long totalStudents = classRepository.findAll().stream()
                    .mapToInt(CourseClass::getEnrolledCount)
                    .sum();
            stats.put("totalStudents", totalStudents);

            double averageRating = classRepository.findAll().stream()
                    .filter(c -> c.getAverageRating() != null && c.getAverageRating() > 0)
                    .mapToDouble(CourseClass::getAverageRating)
                    .average()
                    .orElse(0.0);
            stats.put("averageRating", averageRating);

            long activeClasses = classRepository.findAll().stream()
                    .filter(c -> c.getEnrolledCount() > 0)
                    .count();
            stats.put("activeClasses", activeClasses);

            return ResponseEntity.ok(ApiResponse.success(stats, "Class stats retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching class stats: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllClasses(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        try {
            List<ClassResponse> classes;
            if (search != null && !search.trim().isEmpty()) {
                classes = classService.searchClasses(search.trim(), null);
            } else {
                classes = classService.getAllClasses();
            }
            return ResponseEntity.ok(ApiResponse.success(classes, "Classes retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching classes: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{classId}")
    public ResponseEntity<?> deleteClass(@PathVariable Long classId) {
        try {
            adminClassService.deleteClass(classId);
            return ResponseEntity.ok(ApiResponse.success(null, "Class deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error deleting class: " + e.getMessage()));
        }
    }
}