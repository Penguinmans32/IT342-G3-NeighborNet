package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.BorrowingAgreement;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BorrowingAgreementRepository extends JpaRepository<BorrowingAgreement, Long> {
    List<BorrowingAgreement> findByBorrowerId(Long borrowerId);
    List<BorrowingAgreement> findByLenderId(Long lenderId);
    List<BorrowingAgreement> findByItemIdAndStatusAndBorrowingEndGreaterThan(
            Long itemId, String status, LocalDateTime date);

    List<BorrowingAgreement> findByItemIdAndStatus(Long itemId, String status);

    @Query("SELECT ba FROM BorrowingAgreement ba " +
            "WHERE ba.itemId = :itemId " +
            "AND ba.status = 'PENDING' " +
            "AND (" +
            "   (ba.borrowingStart BETWEEN :start AND :end) " +
            "   OR (ba.borrowingEnd BETWEEN :start AND :end) " +
            "   OR (:start BETWEEN ba.borrowingStart AND ba.borrowingEnd) " +
            "   OR (:end BETWEEN ba.borrowingStart AND ba.borrowingEnd) " +
            "   OR (ba.borrowingStart <= :start AND ba.borrowingEnd >= :end)" +
            ")")
    List<BorrowingAgreement> findOverlappingAgreements(
            @Param("itemId") Long itemId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    long countByCreatedAtBefore(LocalDateTime date);

    List<BorrowingAgreement> findTop10ByStatusOrderByCreatedAtDesc(String status);

    List<BorrowingAgreement> findByBorrowerIdOrderByCreatedAtDesc(Long userId);

    List<BorrowingAgreement> findByItemIdAndBorrowerIdAndLenderIdAndStatusAndBorrowingEndGreaterThan(
            Long itemId,
            Long borrowerId,
            Long lenderId,
            String status,
            LocalDateTime date
    );

    List<BorrowingAgreement> findByStatusInAndBorrowingEndGreaterThan(
            List<String> statuses,
            LocalDateTime date
    );

    List<BorrowingAgreement> findByItemId(Long itemId);

    Optional<BorrowingAgreement> findFirstByItemIdAndBorrowerIdAndStatusIn(
            Long itemId,
            Long borrowerId,
            List<String> statuses
    );

    @Query("SELECT COUNT(DISTINCT b.borrowerId) FROM BorrowingAgreement b WHERE b.status = :status")
    long countDistinctBorrowerIdByStatus(@Param("status") String status);


    @Query("SELECT b.id FROM BorrowingAgreement b ORDER BY b.createdAt DESC")
    List<Long> findRecentBorrowIds(Pageable pageable);

    @Query("SELECT b FROM BorrowingAgreement b " +
            "WHERE b.id = :id")
    Optional<BorrowingAgreement> findByIdWithDetails(@Param("id") Long id);
}