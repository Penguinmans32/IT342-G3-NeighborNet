package com.example.neighbornetbackend.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class PostImageStorageService {
    private final Storage storage;
    private final String bucketName;

    @Value("${gcp.storage.public-url:https://storage.googleapis.com}")
    private String publicUrl;

    @Autowired
    public PostImageStorageService(Storage storage, @Value("${gcp.storage.bucket-name}") String bucketName) {
        this.storage = storage;
        this.bucketName = bucketName;
    }

    public String storePostImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String filename = UUID.randomUUID().toString() + fileExtension;
        String objectName = "post-images/" + filename;

        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        return "/api/posts/images/" + filename;
    }

    public String getPostImageUrl(String filename) {
        String objectName = "post-images/" + filename;
        return publicUrl + "/" + bucketName + "/" + objectName;
    }

    public void deletePostImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) return;

        try {
            String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            String objectName = "post-images/" + filename;

            BlobId blobId = BlobId.of(bucketName, objectName);
            boolean deleted = storage.delete(blobId);

            if (deleted) {
                System.out.println("Successfully deleted image: " + objectName);
            } else {
                System.out.println("Image not found or could not be deleted: " + objectName);
            }
        } catch (Exception e) {
            System.err.println("Error deleting image: " + e.getMessage());
        }
    }
}