package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.model.CourseClass;
import com.example.neighbornetbackend.repository.ClassEnrollmentRepository;
import com.example.neighbornetbackend.repository.ClassRepository;
import com.example.neighbornetbackend.repository.LessonRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Transactional
public class AdminClassService {
    @PersistenceContext
    private EntityManager entityManager;

    private final ClassRepository classRepository;
    private final ClassEnrollmentRepository classEnrollmentRepository;
    private final LessonRepository lessonRepository;
    private final String THUMBNAIL_DIRECTORY = "thumbnails";

    public AdminClassService(ClassRepository classRepository,
                             ClassEnrollmentRepository classEnrollmentRepository,
                             LessonRepository lessonRepository) {
        this.classRepository = classRepository;
        this.classEnrollmentRepository = classEnrollmentRepository;
        this.lessonRepository = lessonRepository;
    }

    @Transactional
    public void deleteClass(Long classId) {
        CourseClass courseClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        // First handle the thumbnail deletion if exists
        if (courseClass.getThumbnailUrl() != null) {
            try {
                Path thumbnailPath = Paths.get(THUMBNAIL_DIRECTORY)
                        .resolve(Paths.get(courseClass.getThumbnailUrl()).getFileName());
                Files.deleteIfExists(thumbnailPath);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        // Clear the managed entity from persistence context
        entityManager.clear();

        // Delete saved classes first
        entityManager.createNativeQuery(
                        "DELETE FROM saved_classes WHERE class_id = ?")
                .setParameter(1, classId)
                .executeUpdate();

        // Delete quiz-related data
        entityManager.createNativeQuery(
                        "DELETE FROM quiz_attempts WHERE quiz_id IN " +
                                "(SELECT id FROM quizzes WHERE class_id = ?)")
                .setParameter(1, classId)
                .executeUpdate();

        entityManager.createNativeQuery(
                        "DELETE FROM questions WHERE quiz_id IN " +
                                "(SELECT id FROM quizzes WHERE class_id = ?)")
                .setParameter(1, classId)
                .executeUpdate();

        entityManager.createNativeQuery(
                        "DELETE FROM quizzes WHERE class_id = ?")
                .setParameter(1, classId)
                .executeUpdate();

        // Delete feedback reactions
        entityManager.createNativeQuery(
                        "DELETE FROM feedback_reactions WHERE feedback_id IN " +
                                "(SELECT id FROM feedbacks WHERE class_id = ?)")
                .setParameter(1, classId)
                .executeUpdate();

        // Delete feedbacks
        entityManager.createNativeQuery(
                        "DELETE FROM feedbacks WHERE class_id = ?")
                .setParameter(1, classId)
                .executeUpdate();

        // Delete class ratings
        entityManager.createNativeQuery(
                        "DELETE FROM class_ratings WHERE class_id = ?")
                .setParameter(1, classId)
                .executeUpdate();

        // Delete lesson ratings
        entityManager.createNativeQuery(
                        "DELETE FROM lesson_ratings WHERE lesson_id IN " +
                                "(SELECT id FROM lessons WHERE class_id = ?)")
                .setParameter(1, classId)
                .executeUpdate();

        // Delete lesson progress
        entityManager.createNativeQuery(
                        "DELETE FROM lesson_progress WHERE lesson_id IN " +
                                "(SELECT id FROM lessons WHERE class_id = ?)")
                .setParameter(1, classId)
                .executeUpdate();

        // Delete lessons
        entityManager.createNativeQuery(
                        "DELETE FROM lessons WHERE class_id = ?")
                .setParameter(1, classId)
                .executeUpdate();

        // Delete class enrollments
        entityManager.createNativeQuery(
                        "DELETE FROM class_enrollments WHERE course_class_id = ?")
                .setParameter(1, classId)
                .executeUpdate();

        // Finally delete the class using native query instead of JPA
        entityManager.createNativeQuery(
                        "DELETE FROM classes WHERE id = ?")
                .setParameter(1, classId)
                .executeUpdate();

        // Ensure all changes are synchronized
        entityManager.flush();
    }
}