package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.exception.OAuth2AuthenticationProcessingException;
import com.example.neighbornetbackend.model.OAuth2UserInfo;
import com.example.neighbornetbackend.model.OAuth2UserInfoFactory;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.UserRepository;
import com.example.neighbornetbackend.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);
        logger.info("OAuth2User attributes: {}", oAuth2User.getAttributes());

        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (Exception ex) {
            logger.error("Error processing OAuth2 user", ex);
            try {
                throw new OAuth2AuthenticationProcessingException("Failed to process OAuth2 user");
            } catch (OAuth2AuthenticationProcessingException e) {
                throw new RuntimeException(e);
            }
        }
    }

    @Transactional
    protected OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) throws OAuth2AuthenticationProcessingException {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        logger.info("Processing OAuth2 user for provider: {}", registrationId);

        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
                registrationId,
                oAuth2User.getAttributes()
        );

        String email = oAuth2UserInfo.getEmail();
        if (email == null) {
            throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
        }

        User user = userRepository.findByEmail(email)
                .map(existingUser -> {
                    try {
                        return updateExistingUser(existingUser, oAuth2UserRequest, oAuth2UserInfo);
                    } catch (OAuth2AuthenticationProcessingException e) {
                        throw new RuntimeException(e);
                    }
                })
                .orElseGet(() -> {
                    try {
                        return registerNewUser(oAuth2UserRequest, oAuth2UserInfo);
                    } catch (OAuth2AuthenticationProcessingException e) {
                        throw new RuntimeException(e);
                    }
                });

        return UserPrincipal.create(user, oAuth2User.getAttributes());
    }

    @Transactional
    protected User registerNewUser(OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo) throws OAuth2AuthenticationProcessingException {
        logger.info("Registering new OAuth2 user: {}", oAuth2UserInfo.getEmail());

        User user = new User();
        user.setProvider(oAuth2UserRequest.getClientRegistration().getRegistrationId());
        user.setProviderId(oAuth2UserInfo.getId());
        user.setEmail(oAuth2UserInfo.getEmail());
        user.setEmailVerified(true);

        // Generate a unique username if needed
        String baseUsername = oAuth2UserInfo.getName() != null ?
                oAuth2UserInfo.getName() :
                oAuth2UserInfo.getEmail().substring(0, oAuth2UserInfo.getEmail().indexOf('@'));
        user.setUsername(generateUniqueUsername(baseUsername));

        user.setImageUrl(oAuth2UserInfo.getImageUrl());
        user.setPassword(""); // Empty password for OAuth2 users
        user.setRole("ROLE_USER");

        try {
            return userRepository.save(user);
        } catch (Exception e) {
            logger.error("Error saving new OAuth2 user", e);
            throw new OAuth2AuthenticationProcessingException("Failed to save OAuth2 user");
        }
    }

    @Transactional
    protected User updateExistingUser(User user, OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo) throws OAuth2AuthenticationProcessingException {
        logger.info("Updating existing OAuth2 user: {}", user.getEmail());

        String currentProvider = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        if (!currentProvider.equals(user.getProvider())) {
            user.setProvider(currentProvider);
            user.setProviderId(oAuth2UserInfo.getId());
        }

        if (oAuth2UserInfo.getName() != null && !oAuth2UserInfo.getName().equals(user.getUsername())) {
            String newUsername = generateUniqueUsername(oAuth2UserInfo.getName());
            user.setUsername(newUsername);
        }

        if (oAuth2UserInfo.getImageUrl() != null &&
                (user.getImageUrl() == null || user.getImageUrl().isEmpty() ||
                        user.getImageUrl().equals("/images/defaultProfile.png"))) {
            user.setImageUrl(oAuth2UserInfo.getImageUrl());
        }

        try {
            return userRepository.save(user);
        } catch (Exception e) {
            logger.error("Error updating OAuth2 user", e);
            throw new OAuth2AuthenticationProcessingException("Failed to update OAuth2 user");
        }
    }

    private String generateUniqueUsername(String baseUsername) {
        String username = baseUsername;
        int counter = 1;

        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter++;
        }

        return username;
    }
}
