package com.example.neighbornetbackend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String to, String token, String otp, boolean isMobileRequest) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Email Verification - NeighborNet");

            String webVerificationLink = frontendUrl + "/verify-email?token=" + token;

            String emailContent;
            if (isMobileRequest) {
                emailContent = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #4a5568;">Welcome to NeighborNet!</h2>
                        <p>Thank you for registering. Please verify your email address.</p>
                        
                        <!-- Mobile Users Section -->
                        <div style="margin: 20px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
                            <p style="margin: 0 0 15px 0;"><strong>Verification Code:</strong></p>
                            <p style="margin: 0 0 10px 0;">Enter this verification code in your mobile app:</p>
                            <div style="background-color: white; padding: 15px; border-radius: 4px; text-align: center;">
                                <span style="font-family: monospace; font-size: 24px; letter-spacing: 5px; color: #4f46e5;">%s</span>
                            </div>
                        </div>
                        
                        <p style="color: #666; margin-top: 20px;">This verification code will expire in 10 minutes.</p>
                        <p style="color: #666;">If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                    """.formatted(otp);
            } else {
                emailContent = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #4a5568;">Welcome to NeighborNet!</h2>
                        <p>Thank you for registering. Please verify your email address.</p>
                        
                        <!-- Web Users Section -->
                        <div style="margin: 20px 0;">
                            <a href="%s" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px;">
                                Verify Email Address
                            </a>
                        </div>
                        
                        <p style="color: #666; margin-top: 20px;">This verification link will expire in 24 hours.</p>
                        <p style="color: #666;">If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                    """.formatted(webVerificationLink);
            }

            helper.setText(emailContent, true);
            mailSender.send(message);
            logger.info("Verification email sent successfully to: {} ({})", to, isMobileRequest ? "mobile" : "web");
        } catch (Exception e) {
            logger.error("Failed to send verification email to: " + to, e);
            throw new MessagingException("Failed to send verification email", e);
        }
    }
}