package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.model.CourseClass;
import com.example.neighbornetbackend.model.Lesson;
import com.example.neighbornetbackend.repository.LessonRepository;
import com.example.neighbornetbackend.repository.ClassRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class LessonService {
    private final LessonRepository lessonRepository;
    private final ClassRepository classRepository;
    private final VideoStorageService videoStorageService;

    public LessonService(
            LessonRepository lessonRepository,
            ClassRepository classRepository,
            VideoStorageService videoStorageService) {
        this.lessonRepository = lessonRepository;
        this.classRepository = classRepository;
        this.videoStorageService = videoStorageService;
    }

    @Transactional
    public Lesson createLesson(
            Long classId,
            String title,
            String description,
            MultipartFile videoFile,
            Long parentLessonId
    ) throws IOException {
        CourseClass classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        Lesson lesson = new Lesson();
        lesson.setTitle(title);
        lesson.setDescription(description);
        lesson.setClassEntity(classEntity);

        if (parentLessonId != null) {
            Lesson parentLesson = lessonRepository.findById(parentLessonId)
                    .orElseThrow(() -> new RuntimeException("Parent lesson not found"));
            lesson.setParentLesson(parentLesson);
        }

        if (videoFile != null && !videoFile.isEmpty()) {
            String videoUrl = videoStorageService.storeVideo(videoFile);
            lesson.setVideoUrl(videoUrl);
        }

        return lessonRepository.save(lesson);
    }

    @Transactional(readOnly = true)
    public List<Lesson> getLessonsByClassId(Long classId) {
        return lessonRepository.findByClassId(classId);
    }

    @Transactional(readOnly = true)
    public List<Lesson> getTopLevelLessons(Long classId) {
        return lessonRepository.findTopLevelLessonsByClassId(classId);
    }

    public Lesson getNextLesson(Long classId, Long currentLessonId) {
        return lessonRepository.findNextLesson(classId, currentLessonId);
    }

    public Lesson getPrevLesson(Long classId, Long currentLessonId) {
        return lessonRepository.findPrevLesson(classId, currentLessonId);
    }

    @Transactional(readOnly = true)
    public Lesson getLessonById(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));
    }


}