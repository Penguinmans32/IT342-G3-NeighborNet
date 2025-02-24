package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.CreateClassRequest;
import com.example.neighbornetbackend.dto.ClassResponse;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.model.CourseClass;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.ClassRepository;
import com.example.neighbornetbackend.repository.LessonProgressRepository;
import com.example.neighbornetbackend.repository.LessonRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.example.neighbornetbackend.model.CourseClass;

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
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;

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
                        FileStorageService fileStorageService, LessonRepository lessonRepository, LessonProgressRepository lessonProgressRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.lessonRepository = lessonRepository;
        this.lessonProgressRepository = lessonProgressRepository;
    }

    private String calculateTotalDuration(List<CourseClass.Section> sections) {
        if (sections == null || sections.isEmpty()) {
            return "0 minutes";
        }

        int totalMinutes = 0;
        for (CourseClass.Section section : sections) {
            String duration = section.getDuration();
            if (duration != null && !duration.trim().isEmpty()) {
                try {
                    String numberOnly = duration.replaceAll("[^0-9.]", "");
                    if (duration.toLowerCase().contains("hour")) {
                        totalMinutes += (int) (Double.parseDouble(numberOnly) * 60);
                    } else {
                        totalMinutes += Integer.parseInt(numberOnly);
                    }
                } catch (NumberFormatException e) {
                    continue;
                }
            }
        }

        if (totalMinutes >= 60) {
            int hours = totalMinutes / 60;
            int minutes = totalMinutes % 60;
            if (minutes == 0) {
                return hours + "h";
            }
            return hours + "h " + minutes + "m";
        }
        return totalMinutes + "m";
    }

    @Transactional
    public ClassResponse createClass(CreateClassRequest request,
                                     MultipartFile thumbnail,
                                     Long userId) throws IOException {

        if (classRepository.existsByTitleAndCreatorId(request.getTitle(), userId)) {
            throw new RuntimeException("You already have a class with this title");
        }

        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String category = request.getCategory();
        String customCategory = request.getCustomCategory();

        if ("other".equals(category) && customCategory != null && !customCategory.trim().isEmpty()) {
            category = customCategory.trim();
        }

        CourseClass newClass = new CourseClass();
        newClass.setTitle(request.getTitle());
        newClass.setDescription(request.getDescription());
        newClass.setThumbnailDescription(request.getThumbnailDescription());
        String totalDuration = calculateTotalDuration(request.getSections());
        newClass.setDuration(totalDuration);
        newClass.setDifficulty(request.getDifficulty());
        newClass.setCategory(category);
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

        newClass.setCreator(creator);
        CourseClass savedClass = classRepository.save(newClass);
        return ClassResponse.fromEntity(savedClass);
    }


    public List<ClassResponse> getClassesByUser(Long userId) {
        return classRepository.findByCreatorId(userId).stream()
                .map(ClassResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private String getFileExtension(String filename) {
        return Optional.ofNullable(filename)
                .filter(f -> f.contains("."))
                .map(f -> f.substring(filename.lastIndexOf(".")))
                .orElse(".jpg");
    }

    @Transactional(readOnly = true)
    public ClassResponse getClassById(Long classId) {
        CourseClass classObj = classRepository.findByIdWithCreator(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));

        return ClassResponse.fromEntity(classObj);
    }

    public List<ClassResponse> getAllClasses() {
        return classRepository.findAllWithCreator().stream()
                .map(ClassResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteClass(Long classId) {
        CourseClass classToDelete = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        try {
            // First delete all lesson progress records
            lessonProgressRepository.deleteByLessonClassId(classId);
            lessonProgressRepository.deleteByClassId(classId);

            // Then delete lessons
            lessonRepository.deleteByClassId(classId);

            // Delete thumbnail if exists
            if (classToDelete.getThumbnailUrl() != null) {
                try {
                    Path thumbnailPath = Paths.get(THUMBNAIL_DIRECTORY)
                            .resolve(Paths.get(classToDelete.getThumbnailUrl()).getFileName());
                    Files.deleteIfExists(thumbnailPath);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            // Finally delete the class
            classRepository.delete(classToDelete);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting class and related data", e);
        }
    }

    @Transactional
    public ClassResponse updateClass(Long classId, CreateClassRequest request,
                                     MultipartFile thumbnail, Long userId) throws IOException {
        CourseClass existingClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        if (!existingClass.getCreator().getId().equals(userId)) {
            throw new SecurityException("User not authorized to update this class");
        }

        existingClass.setTitle(request.getTitle());
        existingClass.setDescription(request.getDescription());
        existingClass.setThumbnailDescription(request.getThumbnailDescription());
        String totalDuration = calculateTotalDuration(request.getSections());
        existingClass.setDuration(totalDuration);
        existingClass.setDifficulty(request.getDifficulty());
        existingClass.setCategory(request.getCategory());
        existingClass.setCreatorName(request.getCreatorName());
        existingClass.setCreatorEmail(request.getCreatorEmail());
        existingClass.setCreatorPhone(request.getCreatorPhone());
        existingClass.setCreatorCredentials(request.getCreatorCredentials());
        existingClass.setLinkedinUrl(request.getLinkedinUrl());
        existingClass.setPortfolioUrl(request.getPortfolioUrl());
        existingClass.setRequirements(request.getRequirements());
        existingClass.setSections(request.getSections());

        if (thumbnail != null && !thumbnail.isEmpty()) {
            if (existingClass.getThumbnailUrl() != null) {
                try {
                    Path oldThumbnailPath = Paths.get(THUMBNAIL_DIRECTORY).resolve(
                            Paths.get(existingClass.getThumbnailUrl()).getFileName()
                    );
                    Files.deleteIfExists(oldThumbnailPath);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            String thumbnailUrl = fileStorageService.storeFile(thumbnail);
            existingClass.setThumbnailUrl(thumbnailUrl);
        }

        CourseClass updatedClass = classRepository.save(existingClass);
        return ClassResponse.fromEntity(updatedClass);
    }
}