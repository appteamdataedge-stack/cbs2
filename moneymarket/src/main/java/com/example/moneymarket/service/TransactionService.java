package com.example.moneymarket.service;

import com.example.moneymarket.dto.TransactionLineDTO;
import com.example.moneymarket.dto.TransactionLineResponseDTO;
import com.example.moneymarket.dto.TransactionRequestDTO;
import com.example.moneymarket.dto.TransactionResponseDTO;
import com.example.moneymarket.entity.CustAcctMaster;
import com.example.moneymarket.entity.GLMovement;
import com.example.moneymarket.entity.GLSetup;
import com.example.moneymarket.entity.TranTable;
import com.example.moneymarket.entity.TranTable.DrCrFlag;
import com.example.moneymarket.entity.TranTable.TranStatus;
import com.example.moneymarket.exception.BusinessException;
import com.example.moneymarket.exception.ResourceNotFoundException;
import com.example.moneymarket.repository.CustAcctMasterRepository;
import com.example.moneymarket.repository.GLMovementRepository;
import com.example.moneymarket.repository.GLSetupRepository;
import com.example.moneymarket.repository.TranTableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for transaction operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TranTableRepository tranTableRepository;
    private final CustAcctMasterRepository custAcctMasterRepository;
    private final GLMovementRepository glMovementRepository;
    private final GLSetupRepository glSetupRepository;
    private final BalanceService balanceService;

    private final Random random = new Random();

    /**
     * Create a new transaction
     * 
     * @param transactionRequestDTO The transaction data
     * @return The created transaction response
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public TransactionResponseDTO createTransaction(TransactionRequestDTO transactionRequestDTO) {
        // Validate transaction balance
        validateTransactionBalance(transactionRequestDTO);
        
        // Generate a transaction ID
        String tranId = generateTransactionId();
        LocalDate tranDate = LocalDate.now();
        LocalDate valueDate = transactionRequestDTO.getValueDate();
        
        List<TranTable> transactions = new ArrayList<>();
        List<GLMovement> glMovements = new ArrayList<>();
        
        // Process each transaction line
        int lineNumber = 1;
        for (TransactionLineDTO lineDTO : transactionRequestDTO.getLines()) {
            // Validate account exists
            CustAcctMaster account = custAcctMasterRepository.findById(lineDTO.getAccountNo())
                    .orElseThrow(() -> new ResourceNotFoundException("Account", "Account Number", lineDTO.getAccountNo()));
            
            // Validate sub-product is active
            if (account.getSubProduct().getSubProductStatus() != com.example.moneymarket.entity.SubProdMaster.SubProductStatus.Active) {
                throw new BusinessException("Cannot process transaction on " + 
                    account.getSubProduct().getSubProductStatus().toString().toLowerCase() + 
                    " sub-product: " + account.getSubProduct().getSubProductName());
            }
            
            // Create transaction record
            String lineId = tranId + "-" + lineNumber++;
            TranTable transaction = TranTable.builder()
                    .tranId(lineId)
                    .tranDate(tranDate)
                    .valueDate(valueDate)
                    .drCrFlag(lineDTO.getDrCrFlag())
                    .tranStatus(TranStatus.Entry)  // Initial status is Entry
                    .accountNo(lineDTO.getAccountNo())
                    .tranCcy(lineDTO.getTranCcy())
                    .fcyAmt(lineDTO.getFcyAmt())
                    .exchangeRate(lineDTO.getExchangeRate())
                    .lcyAmt(lineDTO.getLcyAmt())
                    .debitAmount(lineDTO.getDrCrFlag() == DrCrFlag.D ? lineDTO.getLcyAmt() : BigDecimal.ZERO)
                    .creditAmount(lineDTO.getDrCrFlag() == DrCrFlag.C ? lineDTO.getLcyAmt() : BigDecimal.ZERO)
                    .narration(transactionRequestDTO.getNarration())
                    .udf1(lineDTO.getUdf1())
                    .build();
            
            transactions.add(transaction);
            
            // Get GL number from account
            String glNum = account.getGlNum();
            GLSetup glSetup = glSetupRepository.findById(glNum)
                    .orElseThrow(() -> new ResourceNotFoundException("GL", "GL Number", glNum));
            
            // Update account balance
            BigDecimal newBalance = balanceService.updateAccountBalance(
                    lineDTO.getAccountNo(), lineDTO.getDrCrFlag(), lineDTO.getLcyAmt());
            
            // Update GL balance
            BigDecimal newGLBalance = balanceService.updateGLBalance(
                    glNum, lineDTO.getDrCrFlag(), lineDTO.getLcyAmt());
            
            // Create GL movement record
            GLMovement glMovement = GLMovement.builder()
                    .transaction(transaction)
                    .glSetup(glSetup)
                    .drCrFlag(lineDTO.getDrCrFlag())
                    .tranDate(tranDate)
                    .valueDate(valueDate)
                    .amount(lineDTO.getLcyAmt())
                    .balanceAfter(newGLBalance)
                    .build();
            
            glMovements.add(glMovement);
        }
        
        // Save all transaction lines
        tranTableRepository.saveAll(transactions);
        
        // Save all GL movements
        glMovementRepository.saveAll(glMovements);
        
        // Create response
        TransactionResponseDTO response = buildTransactionResponse(tranId, tranDate, valueDate, 
                transactionRequestDTO.getNarration(), transactions);
        
        log.info("Transaction created with ID: {}", tranId);
        return response;
    }

    /**
     * Get a transaction by ID
     * 
     * @param tranId The transaction ID
     * @return The transaction response
     */
    public TransactionResponseDTO getTransaction(String tranId) {
        // Find all transaction lines with the given transaction ID prefix
        List<TranTable> transactions = tranTableRepository.findAll().stream()
                .filter(t -> t.getTranId().startsWith(tranId + "-"))
                .collect(Collectors.toList());
        
        if (transactions.isEmpty()) {
            throw new ResourceNotFoundException("Transaction", "ID", tranId);
        }
        
        // Get the first line to extract common transaction data
        TranTable firstLine = transactions.get(0);
        
        // Create response
        return buildTransactionResponse(tranId, firstLine.getTranDate(), firstLine.getValueDate(), 
                firstLine.getNarration(), transactions);
    }

    /**
     * Validate that the transaction is balanced (debit equals credit)
     * 
     * @param transactionRequestDTO The transaction data
     */
    private void validateTransactionBalance(TransactionRequestDTO transactionRequestDTO) {
        BigDecimal totalDebits = transactionRequestDTO.getLines().stream()
                .filter(line -> line.getDrCrFlag() == DrCrFlag.D)
                .map(TransactionLineDTO::getLcyAmt)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal totalCredits = transactionRequestDTO.getLines().stream()
                .filter(line -> line.getDrCrFlag() == DrCrFlag.C)
                .map(TransactionLineDTO::getLcyAmt)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        if (totalDebits.compareTo(totalCredits) != 0) {
            throw new BusinessException("Debit amount does not equal credit amount. Please correct the entries.");
        }
    }

    /**
     * Generate a unique transaction ID
     * 
     * @return The transaction ID
     */
    private String generateTransactionId() {
        LocalDate now = LocalDate.now();
        String date = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
        String randomPart = String.format("%03d", random.nextInt(1000));
        
        return "TRN-" + date + "-" + timestamp + randomPart;
    }

    /**
     * Build a transaction response from the transaction lines
     * 
     * @param tranId The transaction ID
     * @param tranDate The transaction date
     * @param valueDate The value date
     * @param narration The narration
     * @param transactions The transaction lines
     * @return The transaction response
     */
    private TransactionResponseDTO buildTransactionResponse(String tranId, LocalDate tranDate, 
            LocalDate valueDate, String narration, List<TranTable> transactions) {
        
        List<TransactionLineResponseDTO> lines = transactions.stream()
                .map(tran -> {
                    String accountNo = tran.getAccountNo();
                    String accountName = custAcctMasterRepository.findById(accountNo)
                            .map(CustAcctMaster::getAcctName)
                            .orElse("");
                            
                    return TransactionLineResponseDTO.builder()
                            .tranId(tran.getTranId())
                            .accountNo(accountNo)
                            .accountName(accountName)
                            .drCrFlag(tran.getDrCrFlag())
                            .tranCcy(tran.getTranCcy())
                            .fcyAmt(tran.getFcyAmt())
                            .exchangeRate(tran.getExchangeRate())
                            .lcyAmt(tran.getLcyAmt())
                            .udf1(tran.getUdf1())
                            .build();
                })
                .collect(Collectors.toList());
                
        return TransactionResponseDTO.builder()
                .tranId(tranId)
                .tranDate(tranDate)
                .valueDate(valueDate)
                .narration(narration)
                .lines(lines)
                .balanced(true)
                .status(transactions.get(0).getTranStatus().toString())
                .build();
    }
}
