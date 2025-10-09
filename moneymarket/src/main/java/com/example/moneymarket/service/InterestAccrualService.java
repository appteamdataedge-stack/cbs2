package com.example.moneymarket.service;

import com.example.moneymarket.entity.*;
import com.example.moneymarket.entity.InttAccrTran.AccrualStatus;
import com.example.moneymarket.entity.TranTable.DrCrFlag;
import com.example.moneymarket.entity.TranTable.TranStatus;
import com.example.moneymarket.exception.BusinessException;
import com.example.moneymarket.exception.ResourceNotFoundException;
import com.example.moneymarket.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service for interest accrual operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InterestAccrualService {

    private final CustAcctMasterRepository custAcctMasterRepository;
    private final SubProdMasterRepository subProdMasterRepository;
    private final AcctBalRepository acctBalRepository;
    private final GLSetupRepository glSetupRepository;
    private final TranTableRepository tranTableRepository;
    private final InttAccrTranRepository inttAccrTranRepository;
    private final GLMovementAccrualRepository glMovementAccrualRepository;
    private final AcctBalAccrualRepository acctBalAccrualRepository;
    private final BalanceService balanceService;
    
    private final Random random = new Random();

    /**
     * Run End of Day processing for interest accruals
     * 
     * @param accrualDate The accrual date (defaults to current date if null)
     * @return Number of accounts processed
     */
    @Transactional
    public int runEODAccruals(LocalDate accrualDate) {
        LocalDate processDate = accrualDate != null ? accrualDate : LocalDate.now();
        log.info("Starting EOD interest accrual process for date: {}", processDate);
        
        // Get all active customer accounts
        List<CustAcctMaster> activeAccounts = custAcctMasterRepository
                .findByAccountStatus(CustAcctMaster.AccountStatus.Active);
        
        if (activeAccounts.isEmpty()) {
            log.info("No active accounts found for accrual processing");
            return 0;
        }
        
        int processedCount = 0;
        List<String> errors = new ArrayList<>();
        
        // Process each account
        for (CustAcctMaster account : activeAccounts) {
            try {
                processAccountAccrual(account, processDate);
                processedCount++;
            } catch (Exception e) {
                log.error("Error processing accrual for account {}: {}", 
                        account.getAccountNo(), e.getMessage());
                errors.add(String.format("Account %s: %s", account.getAccountNo(), e.getMessage()));
            }
        }
        
        log.info("EOD accrual process completed. Processed: {}, Errors: {}", 
                processedCount, errors.size());
        
        if (!errors.isEmpty()) {
            throw new BusinessException("EOD accrual process completed with errors: " + 
                    String.join("; ", errors));
        }
        
        return processedCount;
    }
    
    /**
     * Process accrual for a single account
     * 
     * @param account The account to process
     * @param accrualDate The accrual date
     * @throws BusinessException if accrual processing fails
     */
    private void processAccountAccrual(CustAcctMaster account, LocalDate accrualDate) {
        String accountNo = account.getAccountNo();
        
        // Get interest rate for the account's sub-product
        SubProdMaster subProduct = account.getSubProduct();
        BigDecimal interestRate = getInterestRate(subProduct);
        
        if (interestRate == null || interestRate.compareTo(BigDecimal.ZERO) == 0) {
            log.info("Skipping accrual for account {} - no interest rate configured", accountNo);
            return;
        }
        
        // Get account balance
        AcctBal accountBalance = acctBalRepository.findById(accountNo)
                .orElseThrow(() -> new ResourceNotFoundException("Account Balance", "Account Number", accountNo));
        
        // Calculate interest amount
        BigDecimal balance = accountBalance.getCurrentBalance();
        if (balance.compareTo(BigDecimal.ZERO) == 0) {
            log.info("Skipping accrual for account {} - zero balance", accountNo);
            return;
        }
        
        // Simple interest calculation: principal * rate * (1/365)
        BigDecimal interestAmount = balance
                .multiply(interestRate)
                .divide(new BigDecimal("36500"), 2, RoundingMode.HALF_UP);
        
        // Generate transaction ID for accrual
        String tranId = generateAccrualTransactionId(accrualDate);
        
        // Create interest accrual transaction
        InttAccrTran accrualTran = InttAccrTran.builder()
                .tranId(tranId)
                .accountNo(accountNo)
                .accrualDate(accrualDate)
                .interestRate(interestRate)
                .amount(interestAmount)
                .status(AccrualStatus.Verified) // Accruals are automatically verified
                .build();
        
        InttAccrTran savedAccrualTran = inttAccrTranRepository.save(accrualTran);
        
        // Create transaction records
        TranTable tranRecord = TranTable.builder()
                .tranId(tranId)
                .tranDate(accrualDate)
                .valueDate(accrualDate)
                .drCrFlag(DrCrFlag.D) // Interest expense is debit for the bank
                .tranStatus(TranStatus.Verified)
                .accountNo(accountNo)
                .tranCcy("USD") // Default currency
                .fcyAmt(interestAmount)
                .exchangeRate(BigDecimal.ONE)
                .lcyAmt(interestAmount)
                .narration("Interest Accrual for " + accountNo)
                .build();
                
        tranTableRepository.save(tranRecord);
        
        // Create GL Movement for accrual
        // Find interest expense GL and interest payable GL
        // This is simplified - in a real system you'd have proper mapping
        String expenseGlNum = findInterestExpenseGL(account);
        String payableGlNum = findInterestPayableGL(account);
        
        GLSetup expenseGl = glSetupRepository.findById(expenseGlNum)
                .orElseThrow(() -> new BusinessException("Interest Expense GL not found: " + expenseGlNum));
                
        GLSetup payableGl = glSetupRepository.findById(payableGlNum)
                .orElseThrow(() -> new BusinessException("Interest Payable GL not found: " + payableGlNum));
        
        // Create GL movements - ensure balanced entries (debit expense, credit payable)
        GLMovementAccrual debitMovement = GLMovementAccrual.builder()
                .accrual(savedAccrualTran)
                .glSetup(expenseGl)
                .drCrFlag(DrCrFlag.D)
                .accrualDate(accrualDate)
                .amount(interestAmount)
                .status(AccrualStatus.Verified)
                .build();
                
        GLMovementAccrual creditMovement = GLMovementAccrual.builder()
                .accrual(savedAccrualTran)
                .glSetup(payableGl)
                .drCrFlag(DrCrFlag.C)
                .accrualDate(accrualDate)
                .amount(interestAmount)
                .status(AccrualStatus.Verified)
                .build();
                
        glMovementAccrualRepository.save(debitMovement);
        glMovementAccrualRepository.save(creditMovement);
        
        // Update GL balances for accrual
        balanceService.updateGLBalance(expenseGlNum, DrCrFlag.D, interestAmount);
        balanceService.updateGLBalance(payableGlNum, DrCrFlag.C, interestAmount);
        
        // Record in Acct_Bal_Accrual
        AcctBalAccrual acctBalAccrual = AcctBalAccrual.builder()
                .account(account)
                .accrualDate(accrualDate)
                .interestAmount(interestAmount)
                .build();
                
        acctBalAccrualRepository.save(acctBalAccrual);
        
        log.info("Processed interest accrual for account {}: {}", accountNo, interestAmount);
    }
    
    /**
     * Get interest rate for a sub-product
     * 
     * @param subProduct The sub-product
     * @return The interest rate as a decimal (e.g., 0.05 for 5%)
     */
    private BigDecimal getInterestRate(SubProdMaster subProduct) {
        // Prefer effective interest rate if precomputed
        if (subProduct.getEffectiveInterestRate() != null) {
            return subProduct.getEffectiveInterestRate();
        }
        // Fallback to zero if none configured
        return BigDecimal.ZERO;
    }
    
    /**
     * Find interest expense GL for an account
     * 
     * @param account The account
     * @return The interest expense GL number
     */
    private String findInterestExpenseGL(CustAcctMaster account) {
        // In a real system, this would be a proper mapping lookup
        // For this prototype, use a simplified approach
        return "610101001"; // Mock Interest Expense GL
    }
    
    /**
     * Find interest payable GL for an account
     * 
     * @param account The account
     * @return The interest payable GL number
     */
    private String findInterestPayableGL(CustAcctMaster account) {
        // In a real system, this would be a proper mapping lookup
        // For this prototype, use a simplified approach
        return "260101001"; // Mock Interest Payable GL
    }
    
    /**
     * Generate a unique transaction ID for accruals
     * 
     * @param accrualDate The accrual date
     * @return The transaction ID
     */
    private String generateAccrualTransactionId(LocalDate accrualDate) {
        String date = accrualDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
        String randomPart = String.format("%03d", random.nextInt(1000));
        
        return "ACCR-" + date + "-" + timestamp + randomPart;
    }
}
