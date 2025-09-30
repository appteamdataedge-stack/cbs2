package com.example.moneymarket.repository;

import com.example.moneymarket.entity.GLMovementAccrual;
import com.example.moneymarket.entity.InttAccrTran.AccrualStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GLMovementAccrualRepository extends JpaRepository<GLMovementAccrual, Long> {
    
    List<GLMovementAccrual> findByAccrualAccrId(Long accrId);
    
    List<GLMovementAccrual> findByGlSetupGlNum(String glNum);
    
    List<GLMovementAccrual> findByStatus(AccrualStatus status);
    
    List<GLMovementAccrual> findByAccrualDate(LocalDate accrualDate);
    
    List<GLMovementAccrual> findByGlSetupGlNumAndAccrualDateBetween(String glNum, LocalDate startDate, LocalDate endDate);
}
