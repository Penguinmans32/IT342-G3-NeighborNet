package com.example.neighbornetbackend.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;
import java.util.HashMap;

@Service
public class FCMService {
    private final FirebaseMessaging firebaseMessaging;

    private final Logger logger = LoggerFactory.getLogger(FCMService.class);

    public FCMService(FirebaseMessaging firebaseMessaging) {
        this.firebaseMessaging = firebaseMessaging;
    }

    public void sendNotification(String token, String title, String body, String type) {
        try {
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putData("type", type)
                    .build();

            String response = firebaseMessaging.send(message);
            logger.info("Successfully sent notification: {}", response);
        } catch (Exception e) {
            logger.error("Failed to send FCM notification", e);
        }
    }

    public void sendChatNotification(String token, String senderName, String message) {
        Map<String, String> data = new HashMap<>();
        data.put("type", "CHAT_MESSAGE");
        data.put("senderName", senderName);

        try {
            Message fcmMessage = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle("New message from " + senderName)
                            .setBody(message)
                            .build())
                    .putAllData(data)
                    .build();

            String response = firebaseMessaging.send(fcmMessage);
            logger.info("Successfully sent chat notification: {}", response);
        } catch (Exception e) {
            logger.error("Failed to send chat notification", e);
        }
    }
}