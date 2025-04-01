package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.*;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.UserRepository;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.NotificationService;
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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserProfileController {

    private final UserRepository userRepository;
    private final UserProfileStorageService userProfileStorageService;
    private final UserService userService;
    private final NotificationService notificationService;

    public UserProfileController(UserRepository userRepository, UserProfileStorageService userProfileStorageService, UserService userService, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.userProfileStorageService = userProfileStorageService;
        this.userService = userService;
        this.notificationService = notificationService;
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
                .map(user -> {
                    UserDTO dto = UserDTO.fromEntity(user);
                    dto.setFollowersCount(user.getFollowers().size());
                    dto.setFollowingCount(user.getFollowing().size());
                    return ResponseEntity.ok(dto);
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

    @GetMapping("/{userId}/profile")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId, Authentication authentication) {
        try {
            User targetUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (authentication != null &&
                    targetUser.getUsername().equals(authentication.getName())) {
                return getUserProfile(authentication);
            }

            UserDTO publicProfile = new UserDTO(
                    targetUser.getId(),
                    targetUser.getUsername(),
                    targetUser.getImageUrl(),
                    null,
                    targetUser.getBio()
            );

            publicProfile.setSkills(targetUser.getSkills().stream()
                    .map(skill -> new UserSkillDTO(skill.getName(), skill.getProficiencyLevel()))
                    .collect(Collectors.toList()));

            publicProfile.setInterests(targetUser.getInterests().stream()
                    .map(interest -> interest.getName())
                    .collect(Collectors.toList()));

            Map<String, String> socialLinks = new HashMap<>();
            socialLinks.put("github", targetUser.getGithubUrl());
            socialLinks.put("twitter", targetUser.getTwitterUrl());
            socialLinks.put("linkedin", targetUser.getLinkedinUrl());
            socialLinks.put("facebook", targetUser.getFacebookUrl());
            publicProfile.setSocialLinks(socialLinks);

            return ResponseEntity.ok(publicProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{userId}/follow")
    public ResponseEntity<?> followUser(
            @PathVariable Long userId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            User follower = userService.getUserById(currentUser.getId());
            User userToFollow = userService.getUserById(userId);

            if (follower.equals(userToFollow)) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("You cannot follow yourself"));
            }

            follower.follow(userToFollow);
            userRepository.save(follower);
            userRepository.save(userToFollow);

            notificationService.createAndSendNotification(
                    userId,
                    "New Follower",
                    follower.getUsername() + " started following you",
                    "NEW_FOLLOWER"
            );

            // Return updated counts
            Map<String, Object> response = new HashMap<>();
            response.put("followersCount", userToFollow.getFollowers().size());
            response.put("isFollowing", true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{userId}/unfollow")
    public ResponseEntity<?> unfollowUser(
            @PathVariable Long userId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            User follower = userService.getUserById(currentUser.getId());
            User userToUnfollow = userService.getUserById(userId);

            follower.unfollow(userToUnfollow);
            userRepository.save(follower);
            userRepository.save(userToUnfollow);

            Map<String, Object> response = new HashMap<>();
            response.put("followersCount", userToUnfollow.getFollowers().size());
            response.put("isFollowing", false);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<UserDTO>> getFollowers(
            @PathVariable Long userId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            User user = userService.getUserById(userId);
            User currentUserEntity = userService.getUserById(currentUser.getId());

            List<UserDTO> followers = user.getFollowers().stream()
                    .map(follower -> UserDTO.fromEntity(follower, currentUserEntity))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(followers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<List<UserDTO>> getFollowing(
            @PathVariable Long userId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            User user = userService.getUserById(userId);
            User currentUserEntity = userService.getUserById(currentUser.getId());

            List<UserDTO> following = user.getFollowing().stream()
                    .map(followed -> UserDTO.fromEntity(followed, currentUserEntity))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(following);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}/followers-data")
    public ResponseEntity<?> getFollowersData(
            @PathVariable Long userId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            User targetUser = userService.getUserById(userId);
            User currentUserEntity = userService.getUserById(currentUser.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("followersCount", targetUser.getFollowers().size());
            response.put("followingCount", targetUser.getFollowing().size());
            response.put("isFollowing", targetUser.getFollowers().contains(currentUserEntity));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping(value = "/change-password",
            produces = MediaType.APPLICATION_JSON_VALUE,
            consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> changePassword(
            @RequestBody PasswordChangeRequest request,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("User not authenticated"));
        }

        try {
            userService.changePassword(
                    authentication.getName(),
                    request.getCurrentPassword(),
                    request.getNewPassword()
            );
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new MessageResponse("Password successfully updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(
            @RequestBody DeleteAccountRequest request,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        try {
            userService.deleteAccount(authentication.getName(), request.getPassword());
            return ResponseEntity.ok().body(new MessageResponse("Account successfully deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
}