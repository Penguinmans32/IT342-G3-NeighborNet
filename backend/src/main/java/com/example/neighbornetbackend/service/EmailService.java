package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.security.FirebaseAuthenticationTokenFilter;
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
    private final JavaMailSender mailSender;
    private final int MAX_RETRIES = 3;
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String to, String token, String otp, boolean isMobileRequest) throws MessagingException {
        int retryCount = 0;
        Exception lastException = null;

        while (retryCount < MAX_RETRIES) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(String.format("%s <%s>", "NeighborNet", fromEmail));
                helper.setTo(to);
                helper.setSubject("Email Verification - NeighborNet");

                // Add important headers
                message.addHeader("List-Unsubscribe", "<mailto:" + fromEmail + "?subject=unsubscribe>");
                message.addHeader("Precedence", "bulk");
                message.addHeader("X-Auto-Response-Suppress", "OOF, AutoReply");
                message.addHeader("X-Priority", "1");
                message.addHeader("Importance", "High");

                String webVerificationLink = frontendUrl + "/verify-email?token=" + token;

                String emailContent = createEmailContent(isMobileRequest, webVerificationLink, otp);
                helper.setText(emailContent, true);

                mailSender.send(message);
                logger.info("Verification email sent successfully to: {} ({}) - Attempt {}",
                        to, isMobileRequest ? "mobile" : "web", retryCount + 1);
                return;

            } catch (Exception e) {
                lastException = e;
                logger.warn("Failed to send verification email to: {} - Attempt {} - Error: {}",
                        to, retryCount + 1, e.getMessage());
                retryCount++;
                if (retryCount < MAX_RETRIES) {
                    try {
                        Thread.sleep(1000 * retryCount); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        logger.error("Failed to send verification email after {} attempts", MAX_RETRIES);
        throw new MessagingException("Failed to send verification email after " + MAX_RETRIES + " attempts", lastException);
    }

    private String createEmailContent(boolean isMobileRequest, String webVerificationLink, String otp) {
        if (isMobileRequest) {
            return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4f46e5; margin-bottom: 10px;">Welcome to NeighborNet!</h1>
                        <p style="color: #374151; font-size: 16px;">Thank you for joining our community.</p>
                    </div>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="color: #374151; font-size: 16px; margin-bottom: 15px;">Your verification code is:</p>
                        <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; text-align: center;">
                            <span style="font-family: monospace; font-size: 32px; letter-spacing: 5px; color: #4f46e5;">%s</span>
                        </div>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
                        <p style="color: #6b7280; font-size: 14px;">If you didn't request this verification, please ignore this email.</p>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
                        <p>© NeighborNet. All rights reserved.</p>
                        <p>Please add %s to your contacts to ensure delivery.</p>
                    </div>
                </div>
                """.formatted(otp, fromEmail);
        } else {
            return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4f46e5; margin-bottom: 10px;">Welcome to NeighborNet!</h1>
                        <p style="color: #374151; font-size: 16px;">Thank you for joining our community.</p>
                    </div>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="color: #374151; font-size: 16px; margin-bottom: 15px;">Please verify your email address by clicking the button below:</p>
                        <div style="text-align: center;">
                            <a href="%s" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                                Verify Email Address
                            </a>
                        </div>
                    </div>

                    <div style="margin-top: 20px;">
                        <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #4f46e5;">%s</p>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 14px;">This link will expire in 24 hours.</p>
                        <p style="color: #6b7280; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
                        <p>© NeighborNet. All rights reserved.</p>
                        <p>Please add %s to your contacts to ensure delivery.</p>
                    </div>
                </div>
                """.formatted(webVerificationLink, webVerificationLink, fromEmail);
        }
    }

    public void sendPasswordResetEmail(String to, String otp) throws MessagingException {
        int retryCount = 0;
        Exception lastException = null;

        while (retryCount < MAX_RETRIES) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(String.format("%s <%s>", "NeighborNet", fromEmail));
                helper.setTo(to);
                helper.setSubject("Password Reset - NeighborNet");

                message.addHeader("List-Unsubscribe", "<mailto:" + fromEmail + "?subject=unsubscribe>");
                message.addHeader("Precedence", "bulk");
                message.addHeader("X-Auto-Response-Suppress", "OOF, AutoReply");
                message.addHeader("X-Priority", "1");
                message.addHeader("Importance", "High");

                String emailContent = createPasswordResetEmailContent(otp);
                helper.setText(emailContent, true);

                mailSender.send(message);
                logger.info("Password reset email sent successfully to: {} - Attempt {}",
                        to, retryCount + 1);
                return;

            } catch (Exception e) {
                lastException = e;
                logger.warn("Failed to send password reset email to: {} - Attempt {} - Error: {}",
                        to, retryCount + 1, e.getMessage());
                retryCount++;
                if (retryCount < MAX_RETRIES) {
                    try {
                        Thread.sleep(1000 * retryCount);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        logger.error("Failed to send password reset email after {} attempts", MAX_RETRIES);
        throw new MessagingException("Failed to send password reset email after " + MAX_RETRIES + " attempts", lastException);
    }

    // Add this method to create password reset email content
    private String createPasswordResetEmailContent(String otp) {
        return """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4f46e5; margin-bottom: 10px;">Password Reset Request</h1>
                <p style="color: #374151; font-size: 16px;">We received a request to reset your password.</p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #374151; font-size: 16px; margin-bottom: 15px;">Your password reset code is:</p>
                <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; text-align: center;">
                    <span style="font-family: monospace; font-size: 32px; letter-spacing: 5px; color: #4f46e5;">%s</span>
                </div>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
                <p style="color: #6b7280; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
                <p>© NeighborNet. All rights reserved.</p>
                <p>Please add %s to your contacts to ensure delivery.</p>
            </div>
        </div>
        """.formatted(otp, fromEmail);
    }
}