package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.*;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.*;
import com.example.neighbornetbackend.service.RefreshTokenService;
import com.example.neighbornetbackend.service.UserDeletionService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class UserManagementController {

    @PersistenceContext
    private EntityManager entityManager;

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;
    private final UserDeletionService userDeletionService;


    public UserManagementController(
            UserRepository userRepository, UserDeletionService userDeletionService,  PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userDeletionService = userDeletionService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats() {
        try {
            long totalUsers = userRepository.count();
            long activeUsers = userRepository.countActiveUsers();
            long newThisMonth = userRepository.countNewUsersFrom(
                    LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0)
            );

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("activeUsers", activeUsers);
            stats.put("newThisMonth", newThisMonth);

            return ResponseEntity.ok(ApiResponse.success(stats, "User stats retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching user stats: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUsers(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        try {
            Sort.Direction direction = Sort.Direction.fromString(sortDir);
            PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

            Page<User> usersPage = userRepository.searchUsers(search, pageRequest);

            Page<UserResponse> userResponses = usersPage.map(user -> new UserResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole(),
                    user.getImageUrl(),
                    user.isEmailVerified(),
                    user.getCreatedDate(),
                    user.getBio(),
                    user.getGithubUrl(),
                    user.getTwitterUrl(),
                    user.getLinkedinUrl(),
                    user.getFacebookUrl()
            ));

            return ResponseEntity.ok(ApiResponse.success(userResponses, "Users retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching users: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            userDeletionService.deleteUserAndRelatedData(userId);
            return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error deleting user: " + e.getMessage()));
        }
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody Map<String, Object> updates) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            updates.forEach((key, value) -> {
                switch (key) {
                    case "username":
                        user.setUsername((String) value);
                        break;
                    case "email":
                        user.setEmail((String) value);
                        break;
                    case "role":
                        user.setRole((String) value);
                        break;
                    case "status":
                        user.setEmailVerified(value.equals("active"));
                        break;
                    case "bio":
                        user.setBio((String) value);
                        break;
                    case "githubUrl":
                        user.setGithubUrl((String) value);
                        break;
                    case "twitterUrl":
                        user.setTwitterUrl((String) value);
                        break;
                    case "linkedinUrl":
                        user.setLinkedinUrl((String) value);
                        break;
                    case "facebookUrl":
                        user.setFacebookUrl((String) value);
                        break;
                }
            });

            User updatedUser = userRepository.save(user);
            UserResponse response = new UserResponse(
                    updatedUser.getId(),
                    updatedUser.getUsername(),
                    updatedUser.getEmail(),
                    updatedUser.getRole(),
                    updatedUser.getImageUrl(),
                    updatedUser.isEmailVerified(),
                    updatedUser.getCreatedDate(),
                    updatedUser.getBio(),
                    updatedUser.getGithubUrl(),
                    updatedUser.getTwitterUrl(),
                    updatedUser.getLinkedinUrl(),
                    updatedUser.getFacebookUrl()
            );

            return ResponseEntity.ok(ApiResponse.success(response, "User updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error updating user: " + e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody AdminUserCreateRequest request) {
        try {
            if(userRepository.existsByUsername(request.getUsername())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Username is already taken!"));
            }
            if(userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email is already in use!"));
            }

            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(request.getRole() != null ? request.getRole() : "ROLE_USER");
            user.setEmailVerified(request.isEmailVerified());
            user.setBio(request.getBio());
            user.setGithubUrl(request.getGithubUrl());
            user.setTwitterUrl(request.getTwitterUrl());
            user.setLinkedinUrl(request.getLinkedinUrl());
            user.setFacebookUrl(request.getFacebookUrl());

            User savedUser = userRepository.save(user);

            UserResponse response = new UserResponse(
                    savedUser.getId(),
                    savedUser.getUsername(),
                    savedUser.getEmail(),
                    savedUser.getRole(),
                    savedUser.getImageUrl(),
                    savedUser.isEmailVerified(),
                    savedUser.getCreatedDate(),
                    savedUser.getBio(),
                    savedUser.getGithubUrl(),
                    savedUser.getTwitterUrl(),
                    savedUser.getLinkedinUrl(),
                    savedUser.getFacebookUrl()
            );

            return ResponseEntity.ok(ApiResponse.success(response, "User created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error creating user: " + e.getMessage()));
        }
    }
}