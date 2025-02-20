package com.example.neighbornetbackend.service;

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
public class VideoStorageService {
    private final Path videoLocation;

    public VideoStorageService() {
        this.videoLocation = Paths.get("videos").toAbsolutePath();
        try {
            Files.createDirectories(this.videoLocation);
            System.out.println("Video directory created at: " + this.videoLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create video upload directory!", e);
        }
    }

    public String storeVideo(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".mp4";
        String filename = UUID.randomUUID().toString() + fileExtension;

        Path targetLocation = this.videoLocation.resolve(filename);
        System.out.println("Storing video at: " + targetLocation);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("Video stored successfully");

        // Match the URL pattern in your database
        return "/api/classes/lessons/video/" + filename;
    }

    public Path getVideoPath(String filename) {
        Path path = this.videoLocation.resolve(filename);
        System.out.println("Resolving video path: " + path);
        return path;
    }
}