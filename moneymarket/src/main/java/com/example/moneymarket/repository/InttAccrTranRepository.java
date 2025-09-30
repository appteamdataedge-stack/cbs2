package com.example.moneymarket.repository;

import com.example.moneymarket.entity.InttAccrTran;
import com.example.moneymarket.entity.InttAccrTran.AccrualStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InttAccrTranRepository extends JpaRepository<InttAccrTran, Long> {
    
    List<InttAccrTran> findByAccountNo(String accountNo);
    
    List<InttAccrTran> findByStatus(AccrualStatus status);
    
    List<InttAccrTran> findByAccrualDate(LocalDate accrualDate);
    
    List<InttAccrTran> findByAccrualDateAndStatus(LocalDate accrualDate, AccrualStatus status);
    
    List<InttAccrTran> findByAccountNoAndAccrualDateBetween(String accountNo, LocalDate startDate, LocalDate endDate);
}
