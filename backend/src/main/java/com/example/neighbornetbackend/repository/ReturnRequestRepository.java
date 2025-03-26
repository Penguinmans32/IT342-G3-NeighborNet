package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    List<ReturnRequest> findByItemIdAndStatus(Long itemId, String status);
    Optional<ReturnRequest> findByItemIdAndBorrowerIdAndStatus(Long itemId, Long borrowerId, String status);
    List<ReturnRequest> findByBorrowerId(Long borrowerId);
    List<ReturnRequest> findByLenderId(Long lenderId);
}