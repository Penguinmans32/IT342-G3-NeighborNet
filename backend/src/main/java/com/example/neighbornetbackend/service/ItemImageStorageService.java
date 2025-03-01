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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ItemImageStorageService {
    private final Path itemImagesLocation;

    @Value("${app.baseUrl:http://localhost:8080}")
    private String baseUrl;


    public ItemImageStorageService() {
        this.itemImagesLocation = Paths.get(System.getProperty("user.dir"), "item-images").toAbsolutePath();
        try {
            Files.createDirectories(this.itemImagesLocation);
            System.out.println("Item images directory created at: " + this.itemImagesLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create item images directory!", e);
        }
    }

    public List<String> storeItemImages(List<MultipartFile> files) throws IOException {
        List<String> imageUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ?
                    originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String filename = UUID.randomUUID().toString() + fileExtension;

            Path targetLocation = this.itemImagesLocation.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            imageUrls.add(baseUrl + "/api/borrowing/items/images/" + filename);
        }

        return imageUrls;
    }

    public Path getItemImagePath(String filename) {
        return itemImagesLocation.resolve(filename);
    }
}