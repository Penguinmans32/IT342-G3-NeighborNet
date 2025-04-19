package com.example.neighbornetbackend.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ChatImageStorageService {
    private static final Logger logger = LoggerFactory.getLogger(ChatImageStorageService.class);

    private final Storage storage;
    private final String bucketName;

    @Value("${gcp.storage.public-url:https://storage.googleapis.com}")
    private String publicUrl;

    @Autowired
    public ChatImageStorageService(Storage storage, @Value("${gcp.storage.bucket-name}") String bucketName) {
        this.storage = storage;
        this.bucketName = bucketName;
        logger.info("ChatImageStorageService initialized with bucket: {}", bucketName);
    }

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("File is empty");
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String filename = UUID.randomUUID().toString() + fileExtension;
        String objectName = "chat-images/" + filename;

        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());
        logger.info("Successfully uploaded chat image: {}", objectName);

        return "/chat/images/" + filename;
    }

    public String getChatImageUrl(String filename) {
        String objectName = "chat-images/" + filename;
        return publicUrl + "/" + bucketName + "/" + objectName;
    }

    public Path getChatImagePath(String filename) {
        return Paths.get("chat-images", filename);
    }

    public void deleteChatImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) return;

        try {
            String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            String objectName = "chat-images/" + filename;

            BlobId blobId = BlobId.of(bucketName, objectName);
            boolean deleted = storage.delete(blobId);

            if (deleted) {
                logger.info("Successfully deleted chat image: {}", objectName);
            } else {
                logger.warn("Chat image not found or could not be deleted: {}", objectName);
            }
        } catch (Exception e) {
            logger.error("Error deleting chat image: {}", e.getMessage(), e);
        }
    }
}