package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.ActivityDTO;
import com.example.neighbornetbackend.dto.ActivityResponse;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tracking")
public class TrackingController {
    private final ActivityService activityService;

    public TrackingController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("/user")
    public ResponseEntity<List<ActivityDTO>> getUserActivities(@CurrentUser UserPrincipal currentUser) {
        List<ActivityDTO> activities = activityService.getUserActivities(currentUser.getId());
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ActivityDTO>> getUserActivities(@PathVariable Long userId) {
        List<ActivityDTO> activities = activityService.getUserActivities(userId);
        return ResponseEntity.ok(activities);
    }
}
