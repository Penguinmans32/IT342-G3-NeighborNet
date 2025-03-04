package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.model.BorrowingAgreement;

import java.util.List;

public interface BorrowingAgreementService {
    BorrowingAgreement create(BorrowingAgreement agreement);
    BorrowingAgreement getById(Long id);
    BorrowingAgreement updateStatus(Long id, String status);
    List<BorrowingAgreement> getByBorrowerId(Long borrowerId);
    List<BorrowingAgreement> getByLenderId(Long lenderId);
}