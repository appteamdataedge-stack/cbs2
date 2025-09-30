package com.example.moneymarket.service;

import com.example.moneymarket.entity.AcctBal;
import com.example.moneymarket.entity.CustAcctMaster;
import com.example.moneymarket.entity.TranTable;
import com.example.moneymarket.exception.BusinessException;
import com.example.moneymarket.repository.AcctBalRepository;
import com.example.moneymarket.repository.CustAcctMasterRepository;
import com.example.moneymarket.repository.TranTableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Service for transaction validation
 * 
 * Enforces the following rules:
 * - No liability account can go negative
 * - No asset account can go negative except OD/CC accounts
 * - Before debit transactions system must check:
 *   Available Balance = Yesterday's balance - Today's debits + Today's credits
 * - If debit > available balance → show warning "Insufficient balance."
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionValidationService {

    private final AcctBalRepository acctBalRepository;
    private final CustAcctMasterRepository custAcctMasterRepository;
    private final TranTableRepository tranTableRepository;
    private final GLValidationService glValidationService;

    /**
     * Validate if a debit transaction can be performed on an account
     * 
     * @param accountNo The account number
     * @param amount The debit amount
     * @return true if the transaction is valid, false otherwise
     * @throws BusinessException if the account does not exist
     */
    @Transactional(readOnly = true)
    public boolean validateDebitTransaction(String accountNo, BigDecimal amount) {
        // Find the account
        CustAcctMaster account = custAcctMasterRepository.findById(accountNo)
                .orElseThrow(() -> new BusinessException("Account " + accountNo + " does not exist"));
        
        // Get the account balance
        AcctBal balance = acctBalRepository.findById(accountNo)
                .orElseThrow(() -> new BusinessException("Balance for account " + accountNo + " not found"));
        
        // Calculate available balance
        BigDecimal availableBalance = calculateAvailableBalance(accountNo, balance.getCurrentBalance());
        
        // Check if debit amount exceeds available balance
        if (amount.compareTo(availableBalance) > 0) {
            log.warn("Insufficient balance for account {}: available balance = {}, debit amount = {}", 
                    accountNo, availableBalance, amount);
            return false;
        }
        
        // For liability accounts, never allow negative balance
        if (glValidationService.isLiabilityGL(account.getGlNum())) {
            if (availableBalance.subtract(amount).compareTo(BigDecimal.ZERO) < 0) {
                log.warn("Cannot allow negative balance for liability account {}", accountNo);
                return false;
            }
        }
        
        // For asset accounts, only OD/CC accounts can go negative
        if (glValidationService.isAssetGL(account.getGlNum())) {
            // Check if it's an OD/CC account (product type code = 5)
            boolean isOverdraftAccount = accountNo.length() >= 9 && accountNo.charAt(8) == '5';
            
            if (!isOverdraftAccount && availableBalance.subtract(amount).compareTo(BigDecimal.ZERO) < 0) {
                log.warn("Cannot allow negative balance for non-overdraft asset account {}", accountNo);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Calculate available balance for an account
     * Available Balance = Yesterday's balance - Today's debits + Today's credits
     * 
     * @param accountNo The account number
     * @param currentBalance The current balance
     * @return The available balance
     */
    private BigDecimal calculateAvailableBalance(String accountNo, BigDecimal currentBalance) {
        LocalDate today = LocalDate.now();
        
        // Get today's debits
        BigDecimal todayDebits = tranTableRepository.sumDebitTransactionsForAccountOnDate(accountNo, today)
                .orElse(BigDecimal.ZERO);
        
        // Get today's credits
        BigDecimal todayCredits = tranTableRepository.sumCreditTransactionsForAccountOnDate(accountNo, today)
                .orElse(BigDecimal.ZERO);
        
        // Calculate available balance
        return currentBalance.subtract(todayDebits).add(todayCredits);
    }
    
    /**
     * Update account balance after a transaction
     * 
     * @param accountNo The account number
     * @param amount The transaction amount (positive for credit, negative for debit)
     */
    @Transactional
    public void updateAccountBalance(String accountNo, BigDecimal amount) {
        // Find the account balance
        AcctBal balance = acctBalRepository.findById(accountNo)
                .orElseThrow(() -> new BusinessException("Balance for account " + accountNo + " not found"));
        
        // Update the balance
        balance.setCurrentBalance(balance.getCurrentBalance().add(amount));
        balance.setAvailableBalance(calculateAvailableBalance(accountNo, balance.getCurrentBalance()));
        balance.setLastUpdated(java.time.LocalDateTime.now());
        
        // Save the updated balance
        acctBalRepository.save(balance);
        
        log.info("Updated balance for account {}: new balance = {}", accountNo, balance.getCurrentBalance());
    }
}
