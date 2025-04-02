package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.model.CourseClass;
import com.example.neighbornetbackend.repository.ClassEnrollmentRepository;
import com.example.neighbornetbackend.repository.ClassRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminClassService {
    private final ClassRepository classRepository;
    private final ClassEnrollmentRepository classEnrollmentRepository;

    public AdminClassService(ClassRepository classRepository,
                             ClassEnrollmentRepository classEnrollmentRepository) {
        this.classRepository = classRepository;
        this.classEnrollmentRepository = classEnrollmentRepository;
    }

    @Transactional
    public void deleteClass(Long classId) {
        CourseClass courseClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        classEnrollmentRepository.deleteAllByCourseClassId(classId);

        classRepository.delete(courseClass);
    }
}