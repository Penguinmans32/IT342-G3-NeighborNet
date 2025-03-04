package com.example.neighbornetbackend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ChatImageStorageService {
    private final Path chatImagesLocation;

    @Value("${app.baseUrl:http://localhost:8080}")
    private String baseUrl;

    public ChatImageStorageService() {
        this.chatImagesLocation = Paths.get(System.getProperty("user.dir"), "chat-images").toAbsolutePath();
        try {
            Files.createDirectories(this.chatImagesLocation);
            System.out.println("Chat images directory created at: " + this.chatImagesLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create chat images directory!", e);
        }
    }

    public String store(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String filename = UUID.randomUUID().toString() + fileExtension;

        Path targetLocation = this.chatImagesLocation.resolve(filename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return baseUrl + "/chat/images/" + filename;
    }

    public Path getChatImagePath(String filename) {
        return chatImagesLocation.resolve(filename);
    }

    public void deleteChatImage(String imageUrl) throws IOException {
        String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        Path imagePath = chatImagesLocation.resolve(filename);

        if (Files.exists(imagePath)) {
            Files.delete(imagePath);
        } else {
            throw new IOException("Image file not found: " + filename);
        }
    }
}