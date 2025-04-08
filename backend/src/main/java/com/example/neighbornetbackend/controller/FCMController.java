package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.FCMTokenRequest;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.UserRepository;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fcm")
public class FCMController {
    private final UserRepository userRepository;

    public FCMController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/token")
    public ResponseEntity<?> updateFCMToken(
            @CurrentUser UserPrincipal currentUser,
            @RequestBody FCMTokenRequest tokenRequest) {
        try {
            User user = userRepository.findById(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setFcmToken(tokenRequest.getToken());
            userRepository.save(user);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update FCM token");
        }
    }
}