package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.BorrowingAgreement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BorrowingAgreementRepository extends JpaRepository<BorrowingAgreement, Long> {
    List<BorrowingAgreement> findByBorrowerId(Long borrowerId);
    List<BorrowingAgreement> findByLenderId(Long lenderId);
    List<BorrowingAgreement> findByItemIdAndStatusAndBorrowingEndGreaterThan(
            Long itemId, String status, LocalDateTime date);

    @Query("SELECT ba FROM BorrowingAgreement ba " +
            "WHERE ba.itemId = :itemId " +
            "AND ba.status = 'PENDING' " +
            "AND ((ba.borrowingStart BETWEEN :start AND :end) " +
            "OR (ba.borrowingEnd BETWEEN :start AND :end) " +
            "OR (:start BETWEEN ba.borrowingStart AND ba.borrowingEnd))")
    List<BorrowingAgreement> findOverlappingAgreements(
            @Param("itemId") Long itemId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    long countByCreatedAtBefore(LocalDateTime date);

    List<BorrowingAgreement> findTop10ByStatusOrderByCreatedAtDesc(String status);
}