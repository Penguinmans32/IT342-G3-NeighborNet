package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.*;
import com.example.neighbornetbackend.model.*;
import com.example.neighbornetbackend.repository.*;
import com.example.neighbornetbackend.service.RefreshTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.example.neighbornetbackend.security.JwtTokenProvider;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final ClassRepository classRepository;
    private final PostRepository postRepository;
    private final ItemRepository itemRepository;
    private final TaskRepository taskRepository;

    public AdminController(
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            UserRepository userRepository,
            RefreshTokenService refreshTokenService,
            ClassRepository classRepository,
            PostRepository postRepository,
            ItemRepository itemRepository,
            TaskRepository taskRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
        this.classRepository = classRepository;
        this.postRepository = postRepository;
        this.itemRepository = itemRepository;
        this.taskRepository = taskRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody LoginRequest loginRequest) {
        try {
            User user = userRepository.findByEmail(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.getRole().equals("ROLE_ADMIN")) {
                return ResponseEntity.status(403)
                        .body(ApiResponse.error("Unauthorized access"));
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            AuthResponse authResponse = new AuthResponse(
                    jwt,
                    refreshToken.getToken(),
                    "Bearer",
                    user.getUsername(),
                    user.getId()
            );

            return ResponseEntity.ok()
                    .body(ApiResponse.success(authResponse, "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid credentials"));
        }
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getDashboardData() {
        try {
            long totalUsers = userRepository.count();

            long activeClasses = classRepository.count();

            long totalPosts = postRepository.count();

            long totalItems = itemRepository.count();

            DashboardResponse.UserGrowthData userGrowth = getUserGrowthData();

            List<DashboardResponse.ActivityData> recentActivity = getRecentActivity();

            DashboardResponse dashboardData = DashboardResponse.builder()
                    .totalUsers(totalUsers)
                    .activeClasses(activeClasses)
                    .totalPosts(totalPosts)
                    .totalItems(totalItems)
                    .userGrowth(userGrowth)
                    .recentActivity(recentActivity)
                    .build();

            return ResponseEntity.ok(ApiResponse.success(dashboardData, "Dashboard data retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching dashboard data: " + e.getMessage()));
        }
    }

    private DashboardResponse.UserGrowthData getUserGrowthData() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneWeekAgo = now.minusWeeks(1);
        LocalDateTime oneMonthAgo = now.minusMonths(1);
        LocalDateTime oneYearAgo = now.minusYears(1);

        long weeklyUsers = userRepository.countByCreatedDateBefore(now) -
                userRepository.countByCreatedDateBefore(oneWeekAgo);

        long monthlyUsers = userRepository.countByCreatedDateBefore(now) -
                userRepository.countByCreatedDateBefore(oneMonthAgo);

        long yearlyUsers = userRepository.countByCreatedDateBefore(now) -
                userRepository.countByCreatedDateBefore(oneYearAgo);

        long previousWeekUsers = userRepository.countByCreatedDateBefore(oneWeekAgo) -
                userRepository.countByCreatedDateBefore(now.minusWeeks(2));

        double growthPercentage = previousWeekUsers == 0 ? 100 :
                ((weeklyUsers - previousWeekUsers) / (double) previousWeekUsers) * 100;

        return DashboardResponse.UserGrowthData.builder()
                .weeklyGrowth(weeklyUsers)
                .monthlyGrowth(monthlyUsers)
                .yearlyGrowth(yearlyUsers)
                .growthPercentage(growthPercentage)
                .build();
    }

    @GetMapping("/dashboard/growth/{timeframe}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getGrowthData(@PathVariable String timeframe) {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<DashboardResponse.GrowthDataPoint> growthData = new ArrayList<>();

            switch (timeframe.toLowerCase()) {
                case "weekly":
                    for (int i = 6; i >= 0; i--) {
                        LocalDateTime date = now.minusDays(i);
                        long userCount = userRepository.countByCreatedDateBefore(date);
                        String label = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
                        growthData.add(new DashboardResponse.GrowthDataPoint(label, userCount));
                    }
                    break;

                case "monthly":
                    for (int i = 4; i >= 0; i--) {
                        LocalDateTime date = now.minusWeeks(i);
                        long userCount = userRepository.countByCreatedDateBefore(date);
                        String label = "Week " + (5-i);
                        growthData.add(new DashboardResponse.GrowthDataPoint(label, userCount));
                    }
                    break;

                case "yearly":
                    for (int i = 11; i >= 0; i--) {
                        LocalDateTime date = now.minusMonths(i);
                        long userCount = userRepository.countByCreatedDateBefore(date);
                        String label = date.format(DateTimeFormatter.ofPattern("MMM yyyy"));
                        growthData.add(new DashboardResponse.GrowthDataPoint(label, userCount));
                    }
                    break;

                default:
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Invalid timeframe. Use: weekly, monthly, or yearly"));
            }

            return ResponseEntity.ok(ApiResponse.success(growthData, "Growth data retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching growth data: " + e.getMessage()));
        }
    }

    private List<DashboardResponse.ActivityData> getRecentActivity() {
        List<DashboardResponse.ActivityData> allActivity = new ArrayList<>();

        List<User> recentUsers = userRepository.findTop5ByOrderByCreatedDateDesc();
        for (User user : recentUsers) {
            allActivity.add(DashboardResponse.ActivityData.builder()
                    .type("USER")
                    .title("New user registered: " + user.getUsername())
                    .time(user.getCreatedDate().toString())
                    .userAvatar(user.getImageUrl())
                    .build()
            );
        }

        List<Post> recentPosts = postRepository.findTop5ByOrderByCreatedAtDesc();
        for (Post post : recentPosts) {
            allActivity.add(DashboardResponse.ActivityData.builder()
                    .type("POST")
                    .title("New post created")
                    .time(post.getCreatedAt().toString())
                    .userAvatar(post.getUser().getImageUrl())
                    .build()
            );
        }

        List<Item> recentItems = itemRepository.findTop5ByOrderByCreatedAtDesc();
        for (Item item : recentItems) {
            allActivity.add(DashboardResponse.ActivityData.builder()
                    .type("ITEM")
                    .title("New item listed: " + item.getName())
                    .time(item.getCreatedAt().toString())
                    .userAvatar(item.getOwner().getImageUrl())
                    .build()
            );
        }

        return allActivity.stream()
                .sorted((a1, a2) -> a2.getTime().compareTo(a1.getTime()))
                .limit(5)
                .collect(Collectors.toList());
    }

    @GetMapping("/tasks")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getTasks() {
        try {
            List<Task> tasks = taskRepository.findTop5ByOrderByCreatedAtDesc();
            List<TaskResponse> taskResponses = tasks.stream()
                    .map(task -> new TaskResponse(
                            task.getId(),
                            task.getTitle(),
                            task.getDescription(),
                            task.isCompleted(),
                            task.getDueDate(),
                            task.getCreatedAt(),
                            task.getCreatedBy().getId(),
                            task.getCreatedBy().getUsername()
                    ))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(taskResponses, "Tasks retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching tasks: " + e.getMessage()));
        }
    }

    @PostMapping("/tasks")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createTask(@RequestBody TaskRequest taskRequest) {
        try {
            if (taskRequest.getTitle() == null || taskRequest.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Task title cannot be empty"));
            }

            User currentUser = userRepository.findById(getCurrentUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Task task = new Task();
            task.setTitle(taskRequest.getTitle());
            task.setDescription(taskRequest.getDescription() != null ? taskRequest.getDescription() : "");
            task.setDueDate(taskRequest.getDueDate());
            task.setCompleted(false);
            task.setCreatedBy(currentUser);

            Task savedTask = taskRepository.save(task);

            TaskResponse response = new TaskResponse(
                    savedTask.getId(),
                    savedTask.getTitle(),
                    savedTask.getDescription(),
                    savedTask.isCompleted(),
                    savedTask.getDueDate(),
                    savedTask.getCreatedAt(),
                    currentUser.getId(),
                    currentUser.getUsername()
            );

            return ResponseEntity.ok(ApiResponse.success(response, "Task created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error creating task: " + e.getMessage()));
        }
    }

    @PutMapping("/tasks/{taskId}/toggle")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> toggleTaskCompletion(@PathVariable Long taskId) {
        try {
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            task.setCompleted(!task.isCompleted());
            Task updatedTask = taskRepository.save(task);

            TaskResponse response = new TaskResponse(
                    updatedTask.getId(),
                    updatedTask.getTitle(),
                    updatedTask.getDescription(),
                    updatedTask.isCompleted(),
                    updatedTask.getDueDate(),
                    updatedTask.getCreatedAt(),
                    updatedTask.getCreatedBy().getId(),
                    updatedTask.getCreatedBy().getUsername()
            );

            return ResponseEntity.ok(ApiResponse.success(response, "Task updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error updating task: " + e.getMessage()));
        }
    }

    @DeleteMapping("/tasks/{taskId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteTask(@PathVariable Long taskId) {
        try {
            taskRepository.deleteById(taskId);
            return ResponseEntity.ok(ApiResponse.success(null, "Task deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error deleting task: " + e.getMessage()));
        }
    }


    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        System.out.println("Current username from auth: " + username);

        User user = userRepository.findByEmail(username)
                .orElseGet(() -> userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found - Username: " + username)));

        System.out.println("Found user: " + user.getUsername() + " with ID: " + user.getId());
        return user.getId();
    }
}