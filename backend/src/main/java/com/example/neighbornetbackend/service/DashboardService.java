package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.DashboardStatsDTO;
import com.example.neighbornetbackend.repository.BorrowingAgreementRepository;
import com.example.neighbornetbackend.repository.ClassRepository;
import com.example.neighbornetbackend.repository.ItemRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class DashboardService {
    private final ClassRepository classRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final BorrowingAgreementRepository borrowingAgreementRepository;

    public DashboardService(
            ClassRepository classRepository,
            ItemRepository itemRepository,
            UserRepository userRepository,
            BorrowingAgreementRepository borrowingAgreementRepository) {
        this.classRepository = classRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.borrowingAgreementRepository = borrowingAgreementRepository;
    }

    public DashboardStatsDTO getDashboardStats(Long userId) {
        // Current period stats
        long currentSkillsShared = classRepository.count();
        long currentItemsBorrowed = borrowingAgreementRepository.count();
        long currentActiveUsers = userRepository.countByEmailVerified(true);

        // Previous period stats
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);

        long previousSkillsShared = classRepository.countByCreatedAtBefore(oneMonthAgo);
        long previousItemsBorrowed = borrowingAgreementRepository.countByCreatedAtBefore(oneMonthAgo);
        long previousActiveUsers = userRepository.countByEmailVerifiedAndCreatedDateBefore(true, oneMonthAgo);

        // Calculate percentage changes
        double skillsSharedChange = calculatePercentageChange(previousSkillsShared, currentSkillsShared);
        double itemsBorrowedChange = calculatePercentageChange(previousItemsBorrowed, currentItemsBorrowed);
        double activeUsersChange = calculatePercentageChange(previousActiveUsers, currentActiveUsers);

        DashboardStatsDTO.StatsChangeDTO changes = new DashboardStatsDTO.StatsChangeDTO(
                skillsSharedChange,
                itemsBorrowedChange,
                activeUsersChange
        );

        return new DashboardStatsDTO(
                currentSkillsShared,
                currentItemsBorrowed,
                currentActiveUsers,
                changes
        );
    }

    private double calculatePercentageChange(double previous, double current) {
        if (previous == 0) return 100.0; // If previous was 0, treat as 100% increase
        return ((current - previous) / previous) * 100.0;
    }
}