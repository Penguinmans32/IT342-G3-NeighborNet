package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.DashboardStatsDTO;
import com.example.neighbornetbackend.repository.BorrowingAgreementRepository;
import com.example.neighbornetbackend.repository.ClassRepository;
import com.example.neighbornetbackend.repository.ItemRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;

@Service
public class DashboardService {
    private static final Logger logger = LoggerFactory.getLogger(DashboardService.class);

    private final ClassRepository classRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final BorrowingAgreementRepository borrowingAgreementRepository;

    private DashboardStatsDTO cachedStats;
    private long lastCacheUpdate = 0;
    private static final long CACHE_TTL = 5 * 60 * 1000;

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
        long currentTime = System.currentTimeMillis();

        if (cachedStats != null && (currentTime - lastCacheUpdate) < CACHE_TTL) {
            logger.debug("Returning cached dashboard stats");
            return cachedStats;
        }

        logger.debug("Generating fresh dashboard stats");
        long startTime = System.currentTimeMillis();

        try {
            long currentSkillsShared = classRepository.count();
            long currentItemsBorrowed = borrowingAgreementRepository.count();
            long currentActiveUsers = userRepository.countByEmailVerified(true);

            long previousSkillsShared = 0;
            long previousItemsBorrowed = 0;
            long previousActiveUsers = 0;

            try {
                LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);

                try {
                    previousSkillsShared = getClassCountBefore(oneMonthAgo);
                } catch (Exception e) {
                    logger.warn("Error getting previous skills shared count", e);
                }

                try {
                    previousItemsBorrowed = getBorrowingCountBefore(oneMonthAgo);
                } catch (Exception e) {
                    logger.warn("Error getting previous items borrowed count", e);
                }

                try {
                    previousActiveUsers = getPreviousActiveUsers(oneMonthAgo);
                } catch (Exception e) {
                    logger.warn("Error getting previous active users count", e);
                }
            } catch (Exception e) {
                logger.warn("Error calculating previous stats", e);
            }

            double skillsSharedChange = calculatePercentageChange(previousSkillsShared, currentSkillsShared);
            double itemsBorrowedChange = calculatePercentageChange(previousItemsBorrowed, currentItemsBorrowed);
            double activeUsersChange = calculatePercentageChange(previousActiveUsers, currentActiveUsers);

            DashboardStatsDTO.StatsChangeDTO changes = new DashboardStatsDTO.StatsChangeDTO(
                    skillsSharedChange,
                    itemsBorrowedChange,
                    activeUsersChange
            );

            DashboardStatsDTO result = new DashboardStatsDTO(
                    currentSkillsShared,
                    currentItemsBorrowed,
                    currentActiveUsers,
                    changes
            );

            cachedStats = result;
            lastCacheUpdate = currentTime;

            long timeElapsed = System.currentTimeMillis() - startTime;
            logger.info("Dashboard stats generated in {} ms", timeElapsed);

            return result;
        } catch (Exception e) {
            logger.error("Error generating dashboard stats", e);

            DashboardStatsDTO defaultStats = new DashboardStatsDTO(
                    0L, 0L, 0L,
                    new DashboardStatsDTO.StatsChangeDTO(0.0, 0.0, 0.0)
            );
            return defaultStats;
        }
    }

    private long getClassCountBefore(LocalDateTime date) {
        try {
            if (methodExists(classRepository, "countByCreatedAtBefore", LocalDateTime.class)) {
                return classRepository.countByCreatedAtBefore(date);
            }
            return classRepository.count() / 2;
        } catch (Exception e) {
            logger.warn("Error in getClassCountBefore", e);
            return 0;
        }
    }

    private long getBorrowingCountBefore(LocalDateTime date) {
        try {
            if (methodExists(borrowingAgreementRepository, "countByCreatedAtBefore", LocalDateTime.class)) {
                return borrowingAgreementRepository.countByCreatedAtBefore(date);
            }
            return borrowingAgreementRepository.count() / 2;
        } catch (Exception e) {
            logger.warn("Error in getBorrowingCountBefore", e);
            return 0;
        }
    }

    private long getPreviousActiveUsers(LocalDateTime date) {
        try {
            if (methodExists(userRepository, "countByEmailVerifiedAndCreatedDateBefore", Boolean.class, LocalDateTime.class)) {
                return userRepository.countByEmailVerifiedAndCreatedDateBefore(true, date);
            }
            return userRepository.countByEmailVerified(true) / 2;
        } catch (Exception e) {
            logger.warn("Error in getPreviousActiveUsers", e);
            return 0;
        }
    }

    private boolean methodExists(Object repository, String methodName, Class<?>... paramTypes) {
        try {
            repository.getClass().getMethod(methodName, paramTypes);
            return true;
        } catch (NoSuchMethodException e) {
            return false;
        }
    }

    private double calculatePercentageChange(double previous, double current) {
        if (previous == 0) return current > 0 ? 100.0 : 0.0;
        return ((current - previous) / previous) * 100.0;
    }
}