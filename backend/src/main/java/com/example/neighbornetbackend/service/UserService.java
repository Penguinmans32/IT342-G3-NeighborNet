package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.CreatorDTO;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public CreatorDTO convertToCreatorDTO(User user) {
        return CreatorDTO.fromUser(user);
    }

    @Transactional(readOnly = true)
    public User getCurrentUser(Long userId) {
        return getUserById(userId);
    }
}