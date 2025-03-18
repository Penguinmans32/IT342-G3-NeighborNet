package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.EmailVerificationToken;
import com.example.neighbornetbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByToken(String token);
    Optional<EmailVerificationToken> findByUser(User user);
    Optional<EmailVerificationToken> findByOtp(String otp);

    @Query("SELECT t FROM EmailVerificationToken t WHERE t.user.email = :email AND t.otp = :otp AND t.tokenType = 'PASSWORD_RESET' AND t.verified = false")
    Optional<EmailVerificationToken> findByUserEmailAndOtp(@Param("email") String email, @Param("otp") String otp);

    @Query("SELECT t FROM EmailVerificationToken t WHERE t.user.email = :email ORDER BY t.expiryDate DESC")
    Optional<EmailVerificationToken> findLatestByUserEmail(@Param("email") String email);

    List<EmailVerificationToken> findByUserAndTokenType(User user, EmailVerificationToken.TokenType tokenType);
}