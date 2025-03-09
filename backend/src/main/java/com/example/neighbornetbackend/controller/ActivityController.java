package com.example.neighbornetbackend.controller;


import com.example.neighbornetbackend.dto.ActivityResponse;
import com.example.neighbornetbackend.dto.UserDTO;
import com.example.neighbornetbackend.model.BorrowingAgreement;
import com.example.neighbornetbackend.model.ClassEnrollment;
import com.example.neighbornetbackend.model.Item;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.ItemRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import com.example.neighbornetbackend.service.BorrowingAgreementService;
import com.example.neighbornetbackend.service.ClassService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin
public class ActivityController {
    private final ClassService classService;
    private final BorrowingAgreementService borrowingAgreementService;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;

    public ActivityController(
            ClassService classService,
            BorrowingAgreementService borrowingAgreementService,
            UserRepository userRepository,
            ItemRepository itemRepository
    ) {
        this.classService = classService;
        this.borrowingAgreementService = borrowingAgreementService;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ActivityResponse>> getRecentActivities() {
        try {
            List<ActivityResponse> activities = new ArrayList<>();

            List<ClassEnrollment> recentEnrollments = classService.getRecentEnrollments();
            for (ClassEnrollment enrollment : recentEnrollments) {
                User enrolledUser = userRepository.findById(enrollment.getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found"));

                ActivityResponse activity = new ActivityResponse();
                activity.setType("class");
                activity.setAction("joined");
                activity.setUser(UserDTO.fromEntity(enrolledUser));
                activity.setTitle(enrollment.getCourseClass().getTitle());
                activity.setCreatedAt(enrollment.getEnrolledAt());
                activity.setThumbnailUrl(enrollment.getCourseClass().getThumbnailUrl());

                ActivityResponse.ActivityEngagement engagement = new ActivityResponse.ActivityEngagement();
                engagement.setLikes(enrollment.getCourseClass().getRatingCount().intValue());
                engagement.setComments(enrollment.getCourseClass().getFeedbacks().size());
                activity.setEngagement(engagement);

                activities.add(activity);
            }

            List<BorrowingAgreement> recentBorrows = borrowingAgreementService.getRecentBorrows();
            for (BorrowingAgreement borrow : recentBorrows) {
                ActivityResponse activity = new ActivityResponse();
                activity.setType("borrow");
                activity.setAction("borrowed");
                User borrower = userRepository.findById(borrow.getBorrowerId())
                        .orElseThrow(() -> new RuntimeException("User not found"));
                activity.setUser(UserDTO.fromEntity(borrower));

                Item item = itemRepository.findById(borrow.getItemId())
                        .orElseThrow(() -> new RuntimeException("Item not found"));
                activity.setTitle(item.getName());
                activity.setCreatedAt(borrow.getCreatedAt());

                ActivityResponse.ActivityEngagement engagement = new ActivityResponse.ActivityEngagement();
                engagement.setLikes(0);
                engagement.setComments(0);
                activity.setEngagement(engagement);

                activities.add(activity);
            }

            activities.sort((a1, a2) -> a2.getCreatedAt().compareTo(a1.getCreatedAt()));

            return ResponseEntity.ok(
                    activities.stream().limit(10).collect(Collectors.toList())
            );

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}