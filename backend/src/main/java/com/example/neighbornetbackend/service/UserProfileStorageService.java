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
public class UserProfileStorageService {
    private final Path profilePicturesLocation;

    @Value("${app.baseUrl:http://localhost:8080}")
    private String baseUrl;

    public UserProfileStorageService() {
        this.profilePicturesLocation = Paths.get(System.getProperty("user.dir"), "profile-pictures").toAbsolutePath();
        try {
            Files.createDirectories(this.profilePicturesLocation);
            System.out.println("Profile pictures directory created at: " + this.profilePicturesLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create profile pictures directory!", e);
        }
    }

    public String storeProfilePicture(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String filename = UUID.randomUUID().toString() + fileExtension;

        Path targetLocation = this.profilePicturesLocation.resolve(filename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return the complete URL
        return baseUrl + "/api/users/profile-pictures/" + filename;
    }

    public Path getProfilePicturePath(String filename) {
        return profilePicturesLocation.resolve(filename);
    }
}