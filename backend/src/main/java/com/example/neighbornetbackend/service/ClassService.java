package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.CreateClassRequest;
import com.example.neighbornetbackend.dto.ClassResponse;
import com.example.neighbornetbackend.model.Class;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.ClassRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ClassService {
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    private final String THUMBNAIL_DIRECTORY = "thumbnails";

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(THUMBNAIL_DIRECTORY));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!");
        }
    }

    public ClassService(ClassRepository classRepository,
                        UserRepository userRepository,
                        FileStorageService fileStorageService) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public ClassResponse createClass(CreateClassRequest request,
                                     MultipartFile thumbnail,
                                     Long userId) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Class newClass = new Class();
        newClass.setTitle(request.getTitle());
        newClass.setDescription(request.getDescription());
        newClass.setThumbnailDescription(request.getThumbnailDescription());
        newClass.setDuration(request.getDuration());
        newClass.setDifficulty(request.getDifficulty());
        newClass.setCategory(request.getCategory());
        newClass.setCreatorName(request.getCreatorName());
        newClass.setCreatorEmail(request.getCreatorEmail());
        newClass.setCreatorPhone(request.getCreatorPhone());
        newClass.setCreatorCredentials(request.getCreatorCredentials());
        newClass.setLinkedinUrl(request.getLinkedinUrl());
        newClass.setPortfolioUrl(request.getPortfolioUrl());
        newClass.setRequirements(request.getRequirements());
        newClass.setSections(request.getSections());

        if (thumbnail != null && !thumbnail.isEmpty()) {
            String thumbnailUrl = fileStorageService.storeFile(thumbnail);
            newClass.setThumbnailUrl(thumbnailUrl);
        }

        newClass.setUser(user);
        Class savedClass = classRepository.save(newClass);
        return ClassResponse.fromEntity(savedClass);
    }


    public List<ClassResponse> getClassesByUser(Long userId) {
        return classRepository.findByUserId(userId).stream()
                .map(ClassResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private String getFileExtension(String filename) {
        return Optional.ofNullable(filename)
                .filter(f -> f.contains("."))
                .map(f -> f.substring(filename.lastIndexOf(".")))
                .orElse(".jpg");
    }

    // Add other methods as needed
}