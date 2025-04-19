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
public class UserProfileStorageService {
    private final Storage storage;
    private final String bucketName;

    @Value("${gcp.storage.public-url:https://storage.googleapis.com}")
    private String publicUrl;

    @Autowired
    public UserProfileStorageService(Storage storage, @Value("${gcp.storage.bucket-name}") String bucketName) {
        this.storage = storage;
        this.bucketName = bucketName;
    }

    public String storeProfilePicture(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String filename = "profile-pictures/" + UUID.randomUUID().toString() + fileExtension;

        BlobId blobId = BlobId.of(bucketName, filename);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        // Return the path for database storage
        return "/api/users/profile-pictures/" + filename.substring(17); // Remove "profile-pictures/" prefix
    }

    public String getProfilePictureUrl(String filename) {
        String objectName = "profile-pictures/" + filename;
        return publicUrl + "/" + bucketName + "/" + objectName;
    }
}