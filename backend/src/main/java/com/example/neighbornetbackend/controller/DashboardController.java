package com.example.neighbornetbackend.controller;


import com.example.neighbornetbackend.dto.DashboardStatsDTO;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(@CurrentUser UserPrincipal currentUser) {
        // For public access, pass null or a default value
        Long userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(dashboardService.getDashboardStats(userId));
    }
}
