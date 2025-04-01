package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.CreatorDTO;
import com.example.neighbornetbackend.dto.UpdateProfileRequest;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.model.UserInterest;
import com.example.neighbornetbackend.model.UserSkill;
import com.example.neighbornetbackend.repository.EmailVerificationTokenRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;


    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RefreshTokenService refreshTokenService, EmailVerificationTokenRepository emailVerificationTokenRepository) {
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public CreatorDTO convertToCreatorDTO(User user) {
        return CreatorDTO.fromUser(user);
    }

    @Transactional(readOnly = true)
    public User getCurrentUser(Long userId) {
        return getUserById(userId);
    }

    @Transactional
    public User updateUserProfile(String userIdentifier, UpdateProfileRequest request) {
        User user = userRepository.findByUsernameOrEmail(userIdentifier, userIdentifier)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        if (request.getSkills() != null) {
            user.getSkills().clear();
            request.getSkills().forEach(skillDto -> {
                UserSkill skill = new UserSkill();
                skill.setName(skillDto.getName());
                skill.setProficiencyLevel(skillDto.getLevel());
                skill.setUser(user);
                user.getSkills().add(skill);
            });
        }

        if (request.getInterests() != null) {
            user.getInterests().clear();
            request.getInterests().forEach(interestName -> {
                UserInterest interest = new UserInterest();
                interest.setName(interestName);
                interest.setUser(user);
                user.getInterests().add(interest);
            });
        }

        if (request.getSocialLinks() != null) {
            Map<String, String> socialLinks = request.getSocialLinks();
            user.setGithubUrl(socialLinks.get("github"));
            user.setTwitterUrl(socialLinks.get("twitter"));
            user.setLinkedinUrl(socialLinks.get("linkedin"));
            user.setFacebookUrl(socialLinks.get("facebook"));
        }

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(String userIdentifier, String currentPassword, String newPassword) {
        User user = userRepository.findByUsernameOrEmail(userIdentifier, userIdentifier)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (newPassword.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters long");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(String userIdentifier, String password) {
        User user = userRepository.findByUsernameOrEmail(userIdentifier, userIdentifier)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getProvider() == null && password != null) {
            if (!passwordEncoder.matches(password, user.getPassword())) {
                throw new RuntimeException("Password is incorrect");
            }
        }

        try {
            emailVerificationTokenRepository.deleteAll(
                    emailVerificationTokenRepository.findByUser(user).stream().toList()
            );

            refreshTokenService.deleteByUserId(user.getId());

            user.getFollowers().clear();
            user.getFollowing().clear();
            userRepository.save(user);

            userRepository.delete(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete account: " + e.getMessage());
        }
    }
}