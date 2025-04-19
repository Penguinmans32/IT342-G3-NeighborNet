package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.ActivityResponse;
import com.example.neighbornetbackend.service.ActivityService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin
public class ActivityController {
    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("/recent")
    @Cacheable(value = "recentActivities", key = "'recent'")
    public ResponseEntity<List<ActivityResponse>> getRecentActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<ActivityResponse> activities = activityService.getRecentActivities(page, size);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}