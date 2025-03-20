package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.UpdateProfileRequest;
import com.example.neighbornetbackend.dto.UserDTO;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.UserRepository;
import com.example.neighbornetbackend.service.UserProfileStorageService;
import com.example.neighbornetbackend.service.UserService;
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
    private final UserService userService;

    public UserProfileController(UserRepository userRepository, UserProfileStorageService userProfileStorageService, UserService userService) {
        this.userRepository = userRepository;
        this.userProfileStorageService = userProfileStorageService;
        this.userService = userService;
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
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        String userIdentifier = authentication.getName();
        return userRepository.findByUsernameOrEmail(userIdentifier, userIdentifier)
                .map(user -> ResponseEntity.ok(UserDTO.fromEntity(user)))
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

    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        try {
            String userIdentifier = authentication.getName();
            User updatedUser = userService.updateUserProfile(userIdentifier, request);
            return ResponseEntity.ok(UserDTO.fromEntity(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update profile: " + e.getMessage());
        }
    }
}