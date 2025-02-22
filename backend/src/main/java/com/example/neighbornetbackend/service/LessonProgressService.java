package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.LessonProgressDTO;
import com.example.neighbornetbackend.dto.UpdateProgressRequest;
import com.example.neighbornetbackend.model.Class;
import com.example.neighbornetbackend.model.CourseClass;
import com.example.neighbornetbackend.model.Lesson;
import com.example.neighbornetbackend.model.LessonProgress;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.LessonProgressRepository;
import com.example.neighbornetbackend.repository.ClassRepository;
import com.example.neighbornetbackend.repository.LessonRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LessonProgressService {
    private final LessonProgressRepository progressRepository;
    private final ClassRepository classRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

    public LessonProgressService(
            LessonProgressRepository progressRepository,
            ClassRepository classRepository,
            LessonRepository lessonRepository,
            UserRepository userRepository
    ) {
        this.progressRepository = progressRepository;
        this.classRepository = classRepository;
        this.lessonRepository = lessonRepository;
        this.userRepository = userRepository;
    }

    public List<LessonProgressDTO> getProgressForClass(Long classId, Long userId) {
        return progressRepository.findByClassEntity_IdAndUser_Id(classId, userId)
                .stream()
                .map(LessonProgressDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public LessonProgressDTO updateProgress(Long classId, Long lessonId, Long userId, UpdateProgressRequest request) {
        LessonProgress progress = progressRepository.findByLesson_IdAndUser_Id(lessonId, userId)
                .orElseGet(() -> {
                    LessonProgress newProgress = new LessonProgress();
                    CourseClass classEntity = classRepository.findById(classId)
                            .orElseThrow(() -> new RuntimeException("Class not found"));
                    Lesson lesson = lessonRepository.findById(lessonId)
                            .orElseThrow(() -> new RuntimeException("Lesson not found"));
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));

                    newProgress.setClassEntity(classEntity);
                    newProgress.setLesson(lesson);
                    newProgress.setUser(user);
                    return newProgress;
                });

        progress.setLastWatchedPosition(request.getLastWatchedPosition());

        if (request.isCompleted() && !progress.isCompleted()) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
        }

        progress = progressRepository.save(progress);
        return LessonProgressDTO.fromEntity(progress);
    }
}