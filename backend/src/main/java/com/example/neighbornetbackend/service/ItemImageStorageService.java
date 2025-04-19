package com.example.neighbornetbackend.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ItemImageStorageService {
    private final Storage storage;
    private final String bucketName;

    @Value("${gcp.storage.public-url:https://storage.googleapis.com}")
    private String publicUrl;

    @Autowired
    public ItemImageStorageService(Storage storage, @Value("${gcp.storage.bucket-name}") String bucketName) {
        this.storage = storage;
        this.bucketName = bucketName;
    }

    public List<String> storeItemImages(List<MultipartFile> files) throws IOException {
        List<String> imageUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ?
                    originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String filename = UUID.randomUUID().toString() + fileExtension;
            String objectName = "item-images/" + filename;

            BlobId blobId = BlobId.of(bucketName, objectName);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                    .setContentType(file.getContentType())
                    .build();

            storage.create(blobInfo, file.getBytes());

            imageUrls.add("/api/borrowing/items/images/" + filename);
        }

        return imageUrls;
    }

    public String getItemImageUrl(String filename) {
        String objectName = "item-images/" + filename;
        return publicUrl + "/" + bucketName + "/" + objectName;
    }

    public void deleteItemImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) return;

        try {
            String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            String objectName = "item-images/" + filename;

            BlobId blobId = BlobId.of(bucketName, objectName);
            boolean deleted = storage.delete(blobId);

            if (deleted) {
                System.out.println("Successfully deleted item image: " + objectName);
            } else {
                System.out.println("Item image not found or could not be deleted: " + objectName);
            }
        } catch (Exception e) {
            System.err.println("Error deleting item image: " + e.getMessage());
        }
    }
}