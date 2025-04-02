package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.exception.TokenRefreshException;
import com.example.neighbornetbackend.model.RefreshToken;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.RefreshTokenRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class RefreshTokenService {

    @PersistenceContext
    private EntityManager entityManager;

    @Value("${jwt.refresh.expiration}")
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(RefreshTokenService.class);

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserRepository userRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        try {
            // First, delete existing tokens using JPQL instead of native query
            entityManager.createQuery("DELETE FROM RefreshToken r WHERE r.user.id = :userId")
                    .setParameter("userId", userId)
                    .executeUpdate();
            entityManager.flush();

            // Get user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            // Create new token
            RefreshToken refreshToken = new RefreshToken();
            refreshToken.setUser(user);
            refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
            refreshToken.setToken(UUID.randomUUID().toString());

            // Save and flush
            return refreshTokenRepository.saveAndFlush(refreshToken);
        } catch (Exception e) {
            logger.error("Error creating refresh token for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to create refresh token", e);
        }
    }

    @Transactional
    public void invalidateAllUserTokens(Long userId) {
        try {
            // Use JPQL instead of native query
            entityManager.createQuery("DELETE FROM RefreshToken r WHERE r.user.id = :userId")
                    .setParameter("userId", userId)
                    .executeUpdate();
            entityManager.flush();
        } catch (Exception e) {
            logger.error("Error invalidating tokens for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to invalidate tokens", e);
        }
    }

    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(), "Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    @Transactional
    public void deleteByUserId(Long userId) {
        try {
            Optional<RefreshToken> refreshToken = refreshTokenRepository.findByUserId(userId);
            refreshToken.ifPresent(token -> refreshTokenRepository.delete(token));

            entityManager.createQuery("DELETE FROM RefreshToken r WHERE r.user.id = :userId")
                    .setParameter("userId", userId)
                    .executeUpdate();
            entityManager.flush();
        } catch (Exception e) {
            logger.warn("Failed to delete refresh token for user {}: {}", userId, e.getMessage());
        }
    }

    @Transactional
    @Scheduled(cron = "0 0 * * * *")
    public void deleteExpiredTokens() {
        try {
            entityManager.createQuery("DELETE FROM RefreshToken r WHERE r.expiryDate < :now")
                    .setParameter("now", Instant.now())
                    .executeUpdate();
        } catch (Exception e) {
            logger.error("Error deleting expired tokens: {}", e.getMessage());
        }
    }

    public boolean isRefreshTokenExpired(RefreshToken token) {
        return token.getExpiryDate().compareTo(Instant.now()) < 0;
    }

    @Transactional(readOnly = true)
    public long countActiveTokensForUser(Long userId) {
        return entityManager.createQuery("SELECT COUNT(r) FROM RefreshToken r WHERE r.user.id = :userId AND r.expiryDate > :now", Long.class)
                .setParameter("userId", userId)
                .setParameter("now", Instant.now())
                .getSingleResult();
    }
}