package com.example.moneymarket.repository;

import com.example.moneymarket.entity.AcctBal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface AcctBalRepository extends JpaRepository<AcctBal, String> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ab FROM AcctBal ab WHERE ab.accountNo = ?1")
    Optional<AcctBal> findByAccountNoWithLock(String accountNo);
}
