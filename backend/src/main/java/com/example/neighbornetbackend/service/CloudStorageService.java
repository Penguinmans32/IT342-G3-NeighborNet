package com.example.neighbornetbackend.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.Storage.SignUrlOption;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class CloudStorageService {

    private final Storage storage;
    private final String bucketName;

    @Value("${gcp.storage.public-url}")
    private String publicUrl;

    @Autowired
    public CloudStorageService(Storage storage, String bucketName) {
        this.storage = storage;
        this.bucketName = bucketName;
    }

    public String uploadFile(MultipartFile file, String directory) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String filename = directory + "/" + UUID.randomUUID() + fileExtension;

        BlobId blobId = BlobId.of(bucketName, filename);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        // Return the public URL
        return publicUrl + "/" + bucketName + "/" + filename;
    }

    public List<String> uploadFiles(List<MultipartFile> files, String directory) throws IOException {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            urls.add(uploadFile(file, directory));
        }
        return urls;
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;

        String filename = fileUrl.substring(fileUrl.indexOf(bucketName + "/") + bucketName.length() + 1);
        BlobId blobId = BlobId.of(bucketName, filename);
        storage.delete(blobId);
    }

    public String generateSignedUrl(String objectName, int expirationMinutes) {
        BlobId blobId = BlobId.of(bucketName, objectName);
        return storage.signUrl(
                BlobInfo.newBuilder(blobId).build(),
                expirationMinutes, TimeUnit.MINUTES,
                SignUrlOption.withV4Signature()
        ).toString();
    }
}