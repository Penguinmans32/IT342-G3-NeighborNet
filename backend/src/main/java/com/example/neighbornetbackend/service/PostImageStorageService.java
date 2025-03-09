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
public class PostImageStorageService {
    private final Path postImagesLocation;

    @Value("${app.baseUrl:http://localhost:8080}")
    private String baseUrl;

    public PostImageStorageService() {
        this.postImagesLocation = Paths.get(System.getProperty("user.dir"), "post-images").toAbsolutePath();
        try {
            Files.createDirectories(this.postImagesLocation);
            System.out.println("Post images directory created at: " + this.postImagesLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create post images directory!", e);
        }
    }

    public String storePostImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String filename = UUID.randomUUID().toString() + fileExtension;

        Path targetLocation = this.postImagesLocation.resolve(filename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return baseUrl + "/api/posts/images/" + filename;
    }

    public Path getPostImagePath(String filename) {
        return postImagesLocation.resolve(filename);
    }

    public void deletePostImage(String imageUrl) throws IOException {
        if (imageUrl == null) return;

        String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        Path imagePath = postImagesLocation.resolve(filename);

        if (Files.exists(imagePath)) {
            Files.delete(imagePath);
        }
    }
}