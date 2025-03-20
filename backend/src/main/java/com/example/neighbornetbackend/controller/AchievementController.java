package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.AchievementResponse;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.AchievementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@CrossOrigin
public class AchievementController {
    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping("/user")
    public ResponseEntity<List<AchievementResponse>> getUserAchievements(@CurrentUser UserPrincipal currentUser) {
        List<AchievementResponse> achievements = achievementService.getUserAchievements(currentUser.getId());
        return ResponseEntity.ok(achievements);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AchievementResponse>> getAchievementsForUser(@PathVariable Long userId) {
        List<AchievementResponse> achievements = achievementService.getUserAchievements(userId);
        return ResponseEntity.ok(achievements);
    }
}