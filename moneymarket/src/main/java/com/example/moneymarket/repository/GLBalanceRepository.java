package com.example.moneymarket.repository;

import com.example.moneymarket.entity.GLBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface GLBalanceRepository extends JpaRepository<GLBalance, String> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT gb FROM GLBalance gb WHERE gb.glNum = ?1")
    Optional<GLBalance> findByGlNumWithLock(String glNum);
}
