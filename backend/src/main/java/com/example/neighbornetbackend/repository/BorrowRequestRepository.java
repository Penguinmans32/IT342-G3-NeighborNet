// BorrowRequestRepository.java
package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.BorrowRequest;
import com.example.neighbornetbackend.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {
    @Query("SELECT CASE WHEN COUNT(br) > 0 THEN true ELSE false END FROM BorrowRequest br " +
            "WHERE br.item = :item AND br.status = :status " +
            "AND ((br.startDate BETWEEN :startDate AND :endDate) " +
            "OR (br.endDate BETWEEN :startDate AND :endDate))")
    boolean existsByItemAndStatusAndDateRangeOverlap(
            Item item,
            String status,
            LocalDate startDate,
            LocalDate endDate
    );
}