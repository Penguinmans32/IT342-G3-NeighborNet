package com.example.neighbornetbackend.service;


import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path thumbnailLocation;

    public FileStorageService() {
        // Use absolute path
        this.thumbnailLocation = Paths.get(System.getProperty("user.dir"), "thumbnails").toAbsolutePath();
        try {
            Files.createDirectories(this.thumbnailLocation);
            System.out.println("Thumbnail directory created at: " + this.thumbnailLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    public String storeFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String filename = UUID.randomUUID().toString() + fileExtension;

        Path targetLocation = this.thumbnailLocation.resolve(filename);
        System.out.println("Storing file at: " + targetLocation);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("File stored successfully");

        return "/api/classes/thumbnail/" + filename;
    }
}
