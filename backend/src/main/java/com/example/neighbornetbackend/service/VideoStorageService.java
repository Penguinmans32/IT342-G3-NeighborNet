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
public class VideoStorageService {

    private final Storage storage;
    private final String bucketName;

    @Value("${gcp.storage.public-url}")
    private String publicUrl;

    @Autowired
    public VideoStorageService(Storage storage, String bucketName) {
        this.storage = storage;
        this.bucketName = bucketName;
    }

    public String storeVideo(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".mp4";
        String filename = "videos/" + UUID.randomUUID().toString() + fileExtension;

        BlobId blobId = BlobId.of(bucketName, filename);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        return "/api/classes/lessons/video/" + filename.substring(7);
    }

    public String getVideoUrl(String filename) {
        String objectName = "videos/" + filename;
        return publicUrl + "/" + bucketName + "/" + objectName;
    }

    public String getSignedVideoUrl(String filename, int expirationMinutes) {
        String objectName = "videos/" + filename;
        BlobId blobId = BlobId.of(bucketName, objectName);
        return storage.signUrl(
                BlobInfo.newBuilder(blobId).build(),
                expirationMinutes, java.util.concurrent.TimeUnit.MINUTES,
                Storage.SignUrlOption.withV4Signature()
        ).toString();
    }
}