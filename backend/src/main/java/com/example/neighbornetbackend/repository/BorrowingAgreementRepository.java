package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.BorrowingAgreement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BorrowingAgreementRepository extends JpaRepository<BorrowingAgreement, Long> {
    List<BorrowingAgreement> findByBorrowerId(Long borrowerId);
    List<BorrowingAgreement> findByLenderId(Long lenderId);
}