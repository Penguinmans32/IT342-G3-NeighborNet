package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.ApiResponse;
import com.example.neighbornetbackend.dto.ClassResponse;
import com.example.neighbornetbackend.model.CourseClass;
import com.example.neighbornetbackend.repository.ClassRepository;
import com.example.neighbornetbackend.service.AdminClassService;
import com.example.neighbornetbackend.service.ClassService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    @Cacheable(value = "adminClassStats", key = "'stats'")
    public ResponseEntity<?> getClassStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            long totalClasses = classRepository.count();
            stats.put("totalClasses", totalClasses);

            long totalStudents = classRepository.countTotalEnrolledStudents();
            stats.put("totalStudents", totalStudents);

            double averageRating = classRepository.findAverageRatingAcrossAllClasses();
            stats.put("averageRating", averageRating);

            long activeClasses = classRepository.countClassesWithEnrollments();
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
            Pageable pageable = PageRequest.of(
                    page,
                    size,
                    Sort.Direction.fromString(sortDir),
                    sortBy
            );

            Page<ClassResponse> classesPage;
            if (search != null && !search.trim().isEmpty()) {
                classesPage = classService.searchClassesPaged(search.trim(), null, pageable);
            } else {
                classesPage = classService.getAllClassesPaged(pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("classes", classesPage.getContent());
            response.put("currentPage", classesPage.getNumber());
            response.put("totalItems", classesPage.getTotalElements());
            response.put("totalPages", classesPage.getTotalPages());

            return ResponseEntity.ok(ApiResponse.success(response, "Classes retrieved successfully"));
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