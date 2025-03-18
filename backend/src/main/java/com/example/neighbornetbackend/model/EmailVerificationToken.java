package com.example.neighbornetbackend.model;


import jakarta.persistence.*;
import org.springframework.security.oauth2.core.OAuth2AccessToken;

import java.time.Instant;

@Entity
@Table(name = "email_verification_tokens")
public class EmailVerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String otp;

    private Instant expiryDate;

    private boolean verified = false;

    @Enumerated(EnumType.STRING)
    private TokenType tokenType = TokenType.EMAIL_VERIFICATION;

    private static final long EXPIRATION_TIME = 24 * 60 * 60 * 1000;
    private static final long OTP_EXPIRATION_TIME = 10 * 60 * 1000;

    public enum TokenType {
        EMAIL_VERIFICATION,
        PASSWORD_RESET
    }

    public EmailVerificationToken() {
        this.expiryDate = Instant.now().plusMillis(EXPIRATION_TIME);
    }

    public EmailVerificationToken(User user, String token) {
        this.user = user;
        this.token = token;
        this.expiryDate = Instant.now().plusMillis(EXPIRATION_TIME);
    }


    public EmailVerificationToken(User user, String token, TokenType tokenType) {
        this.user = user;
        this.token = token;
        this.tokenType = tokenType;
        this.expiryDate = Instant.now().plusMillis(
                tokenType == TokenType.PASSWORD_RESET ? OTP_EXPIRATION_TIME : EXPIRATION_TIME
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Instant getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(Instant expiryDate) {
        this.expiryDate = expiryDate;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(this.expiryDate);
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public TokenType getTokenType() {
        return tokenType;
    }

    public void setTokenType(TokenType tokenType) {
        this.tokenType = tokenType;
    }

    public void refreshOtpExpiry() {
        if (this.tokenType == TokenType.PASSWORD_RESET) {
            this.expiryDate = Instant.now().plusMillis(OTP_EXPIRATION_TIME);
        }
    }
}