package com.example.neighbornetbackend.service;


import com.example.neighbornetbackend.model.EmailVerificationToken;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.EmailVerificationTokenRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.Random;
import java.util.UUID;

@Service
@Transactional
public class ForgotPasswordService {
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationTokenRepository tokenRepository;

    public ForgotPasswordService(
            UserRepository userRepository,
            EmailService emailService,
            EmailVerificationService emailVerificationService,
            PasswordEncoder passwordEncoder, EmailVerificationTokenRepository tokenRepository) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.emailVerificationService = emailVerificationService;
        this.passwordEncoder = passwordEncoder;
        this.tokenRepository = tokenRepository;
    }

    @Transactional
    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Invalidate any existing password reset tokens for this user
        tokenRepository.findByUserAndTokenType(user, EmailVerificationToken.TokenType.PASSWORD_RESET)
                .forEach(token -> {
                    token.setVerified(true); // Mark as used
                    tokenRepository.save(token);
                });

        // Create new token
        String otp = generateOTP();
        EmailVerificationToken token = new EmailVerificationToken(
                user,
                UUID.randomUUID().toString(),
                EmailVerificationToken.TokenType.PASSWORD_RESET
        );
        token.setOtp(otp);
        tokenRepository.save(token);

        try {
            emailService.sendPasswordResetEmail(user.getEmail(), otp);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }



    public boolean verifyOtp(String email, String otp) {
        EmailVerificationToken token = tokenRepository.findByUserEmailAndOtp(email, otp)
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));

        if (token.isExpired()) {
            throw new RuntimeException("OTP has expired");
        }

        return true;
    }


    private String generateOTP() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }



    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        try {
            EmailVerificationToken token = tokenRepository.findByUserEmailAndOtp(email, otp)
                    .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

            if (token.isExpired() || token.isVerified()) {
                throw new RuntimeException("Reset token has expired. Please request a new one.");
            }

            User user = token.getUser();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            token.setVerified(true);
            tokenRepository.save(token);

        } catch (Exception e) {
            // Log the error
            throw new RuntimeException("Failed to reset password: " + e.getMessage());
        }
    }
}