package com.example.moneymarket.service;

import com.example.moneymarket.entity.AcctBal;
import com.example.moneymarket.entity.GLBalance;
import com.example.moneymarket.entity.TranTable.DrCrFlag;
import com.example.moneymarket.exception.ResourceNotFoundException;
import com.example.moneymarket.repository.AcctBalRepository;
import com.example.moneymarket.repository.GLBalanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Service for managing account and GL balances
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BalanceService {

    private final AcctBalRepository acctBalRepository;
    private final GLBalanceRepository glBalanceRepository;

    /**
     * Update account balance for a transaction with pessimistic locking to prevent races
     * 
     * @param accountNo The account number
     * @param drCrFlag The debit/credit flag
     * @param amount The transaction amount
     * @return The updated balance
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    @Retryable(retryFor = {Exception.class}, maxAttempts = 3)
    public BigDecimal updateAccountBalance(String accountNo, DrCrFlag drCrFlag, BigDecimal amount) {
        // Get account balance with lock
        AcctBal balance = acctBalRepository.findByAccountNoWithLock(accountNo)
                .orElseThrow(() -> new ResourceNotFoundException("Account Balance", "Account Number", accountNo));

        BigDecimal oldBalance = balance.getCurrentBalance();
        BigDecimal newBalance;

        // Update balance based on debit/credit flag
        if (drCrFlag == DrCrFlag.D) {
            newBalance = oldBalance.add(amount); // Debit increases asset accounts
        } else {
            newBalance = oldBalance.subtract(amount); // Credit decreases asset accounts
        }

        // Update balance
        balance.setCurrentBalance(newBalance);
        balance.setAvailableBalance(newBalance); // In this simple implementation, current = available
        balance.setLastUpdated(LocalDateTime.now());

        // Save updated balance
        acctBalRepository.save(balance);

        log.info("Account balance updated for account {}: {} {} {} = {}", 
                accountNo, oldBalance, drCrFlag, amount, newBalance);

        return newBalance;
    }

    /**
     * Update GL balance for a transaction with pessimistic locking to prevent races
     * 
     * @param glNum The GL number
     * @param drCrFlag The debit/credit flag
     * @param amount The transaction amount
     * @return The updated balance
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    @Retryable(retryFor = {Exception.class}, maxAttempts = 3)
    public BigDecimal updateGLBalance(String glNum, DrCrFlag drCrFlag, BigDecimal amount) {
        // Get GL balance with lock
        GLBalance balance = glBalanceRepository.findByGlNumWithLock(glNum)
                .orElseThrow(() -> new ResourceNotFoundException("GL Balance", "GL Number", glNum));

        BigDecimal oldBalance = balance.getCurrentBalance();
        BigDecimal newBalance;

        // Update balance based on debit/credit flag
        if (drCrFlag == DrCrFlag.D) {
            newBalance = oldBalance.add(amount); // Debit increases asset accounts
        } else {
            newBalance = oldBalance.subtract(amount); // Credit decreases asset accounts
        }

        // Update balance
        balance.setCurrentBalance(newBalance);
        balance.setLastUpdated(LocalDateTime.now());

        // Save updated balance
        glBalanceRepository.save(balance);

        log.info("GL balance updated for GL {}: {} {} {} = {}", 
                glNum, oldBalance, drCrFlag, amount, newBalance);

        return newBalance;
    }

    /**
     * Get current account balance
     * 
     * @param accountNo The account number
     * @return The account balance
     */
    public BigDecimal getAccountBalance(String accountNo) {
        return acctBalRepository.findById(accountNo)
                .map(AcctBal::getCurrentBalance)
                .orElse(BigDecimal.ZERO);
    }

    /**
     * Get current GL balance
     * 
     * @param glNum The GL number
     * @return The GL balance
     */
    public BigDecimal getGLBalance(String glNum) {
        return glBalanceRepository.findById(glNum)
                .map(GLBalance::getCurrentBalance)
                .orElse(BigDecimal.ZERO);
    }
}
