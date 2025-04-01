package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.AuthResponse;
import com.example.neighbornetbackend.dto.LoginRequest;
import com.example.neighbornetbackend.model.RefreshToken;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.UserRepository;
import com.example.neighbornetbackend.service.RefreshTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.example.neighbornetbackend.dto.ApiResponse;
import com.example.neighbornetbackend.security.JwtTokenProvider;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;

    public AdminController(
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            UserRepository userRepository,
            RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody LoginRequest loginRequest) {
        try {
            User user = userRepository.findByEmail(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.getRole().equals("ROLE_ADMIN")) {
                return ResponseEntity.status(403)
                        .body(ApiResponse.error("Unauthorized access"));
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            AuthResponse authResponse = new AuthResponse(
                    jwt,
                    refreshToken.getToken(),
                    "Bearer",
                    user.getUsername(),
                    user.getId()
            );

            return ResponseEntity.ok()
                    .body(ApiResponse.success(authResponse, "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid credentials"));
        }
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getDashboardData() {
        // Add your dashboard data logic here
        return ResponseEntity.ok(ApiResponse.success(null, "Dashboard data retrieved"));
    }
}