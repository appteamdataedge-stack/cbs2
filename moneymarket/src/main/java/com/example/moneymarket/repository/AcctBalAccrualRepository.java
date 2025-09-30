package com.example.moneymarket.repository;

import com.example.moneymarket.entity.AcctBalAccrual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AcctBalAccrualRepository extends JpaRepository<AcctBalAccrual, Long> {
    
    List<AcctBalAccrual> findByAccountAccountNo(String accountNo);
    
    List<AcctBalAccrual> findByAccrualDate(LocalDate accrualDate);
    
    List<AcctBalAccrual> findByAccountAccountNoAndAccrualDateBetween(String accountNo, LocalDate startDate, LocalDate endDate);
}
