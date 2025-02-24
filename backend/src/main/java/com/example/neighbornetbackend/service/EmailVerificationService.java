package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.model.EmailVerificationToken;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.EmailVerificationTokenRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;
import java.util.UUID;

@Service
@Transactional
public class EmailVerificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailVerificationService.class);
    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private static final int OTP_LENGTH = 6;

    public EmailVerificationService(EmailVerificationTokenRepository tokenRepository,
                                    EmailService emailService,
                                    UserRepository userRepository) {
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    private String generateOTP() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    @Transactional
    public String createVerificationToken(User user, boolean isMobileRequest) {
        logger.debug("Creating verification token for user: {} (mobile: {})", user.getEmail(), isMobileRequest);

        String token = UUID.randomUUID().toString();
        String otp = isMobileRequest ? generateOTP() : null;

        EmailVerificationToken verificationToken = new EmailVerificationToken(user, token);
        if (isMobileRequest) {
            verificationToken.setOtp(otp);
            logger.debug("Generated OTP for mobile user: {}", user.getEmail());
        }

        tokenRepository.save(verificationToken);

        try {
            emailService.sendVerificationEmail(user.getEmail(), token, otp, isMobileRequest);
            logger.debug("Sent verification email to: {} (mobile: {})", user.getEmail(), isMobileRequest);
        } catch (MessagingException e) {
            logger.error("Failed to send verification email", e);
            throw new RuntimeException("Failed to send verification email", e);
        }

        return isMobileRequest ? otp : token;
    }

    @Transactional
    public void verifyEmail(String tokenOrOtp, boolean isMobileRequest) {
        EmailVerificationToken verificationToken;

        if (isMobileRequest) {
            verificationToken = tokenRepository.findByOtp(tokenOrOtp)
                    .orElseThrow(() -> new RuntimeException("Invalid verification code"));
        } else {
            verificationToken = tokenRepository.findByToken(tokenOrOtp)
                    .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        }

        if (verificationToken.isExpired()) {
            throw new RuntimeException("Verification code has expired");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        User savedUser = userRepository.saveAndFlush(user);

        verificationToken.setVerified(true);
        tokenRepository.save(verificationToken);

        logger.info("Email verified for user: {}", savedUser.getEmail());
    }
}