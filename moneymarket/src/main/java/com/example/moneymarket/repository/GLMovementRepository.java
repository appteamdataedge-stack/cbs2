package com.example.moneymarket.repository;

import com.example.moneymarket.entity.GLMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GLMovementRepository extends JpaRepository<GLMovement, Long> {
    
    List<GLMovement> findByGlSetupGlNum(String glNum);
    
    List<GLMovement> findByTransactionTranId(String tranId);
    
    List<GLMovement> findByTranDate(LocalDate tranDate);
    
    List<GLMovement> findByValueDate(LocalDate valueDate);
    
    List<GLMovement> findByGlSetupGlNumAndTranDateBetween(String glNum, LocalDate startDate, LocalDate endDate);
}
