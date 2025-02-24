package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.UserRepository;
import com.example.neighbornetbackend.service.UserProfileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserProfileController {

    private final UserRepository userRepository;
    private final UserProfileStorageService userProfileStorageService;

    public UserProfileController(UserRepository userRepository, UserProfileStorageService userProfileStorageService) {
        this.userRepository = userRepository;
        this.userProfileStorageService = userProfileStorageService;
    }

    @GetMapping("/profile-pictures/{filename:.+}")
    public ResponseEntity<Resource> getProfilePicture(@PathVariable String filename) {
        try {
            Path filePath = userProfileStorageService.getProfilePicturePath(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                // Determine content type
                String contentType = "image/jpeg"; // default
                if (filename.endsWith(".png")) {
                    contentType = "image/png";
                } else if (filename.endsWith(".gif")) {
                    contentType = "image/gif";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        System.out.println("Profile endpoint hit");
        if (authentication == null) {
            System.out.println("Authentication is null");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        String userIdentifier = authentication.getName();
        System.out.println("User identifier: " + userIdentifier);

        // Try to find user by both username and email
        return userRepository.findByUsernameOrEmail(userIdentifier, userIdentifier)
                .map(user -> {
                    System.out.println("User found: " + user.getUsername());
                    Map<String, Object> profile = new HashMap<>();
                    profile.put("id", user.getId());
                    profile.put("username", user.getUsername());
                    profile.put("email", user.getEmail());
                    profile.put("imageUrl", user.getImageUrl());
                    profile.put("provider", user.getProvider());
                    profile.put("emailVerified", user.isEmailVerified());
                    return ResponseEntity.ok(profile);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Update the picture endpoint too
    @PutMapping("/profile/picture")
    public ResponseEntity<?> updateProfilePicture(@RequestParam("file") MultipartFile file, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        try {
            String userIdentifier = authentication.getName();
            User user = userRepository.findByUsernameOrEmail(userIdentifier, userIdentifier)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String profilePicturePath = userProfileStorageService.storeProfilePicture(file);
            user.setImageUrl(profilePicturePath);
            userRepository.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", profilePicturePath);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload profile picture");
        }
    }
}