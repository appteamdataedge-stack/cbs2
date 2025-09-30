package com.example.moneymarket.controller;

import com.example.moneymarket.dto.TransactionRequestDTO;
import com.example.moneymarket.dto.TransactionResponseDTO;
import com.example.moneymarket.service.TransactionService;
import com.example.moneymarket.validation.TransactionValidator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for transaction operations
 */
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final TransactionValidator transactionValidator;

    /**
     * Initialize validator for transaction request
     * 
     * @param binder The WebDataBinder
     */
    @InitBinder("transactionRequestDTO")
    public void initBinder(WebDataBinder binder) {
        binder.addValidators(transactionValidator);
    }

    /**
     * Create a new transaction
     * 
     * @param transactionRequestDTO The transaction data
     * @param bindingResult Validation result
     * @return The created transaction
     */
    @PostMapping("/entry")
    public ResponseEntity<TransactionResponseDTO> createTransaction(
            @Valid @RequestBody TransactionRequestDTO transactionRequestDTO,
            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            throw new com.example.moneymarket.exception.BusinessException(
                    bindingResult.getAllErrors().get(0).getDefaultMessage());
        }
        
        TransactionResponseDTO createdTransaction = transactionService.createTransaction(transactionRequestDTO);
        return new ResponseEntity<>(createdTransaction, HttpStatus.CREATED);
    }

    /**
     * Get a transaction by ID
     * 
     * @param tranId The transaction ID
     * @return The transaction
     */
    @GetMapping("/{tranId}")
    public ResponseEntity<TransactionResponseDTO> getTransaction(@PathVariable String tranId) {
        TransactionResponseDTO transaction = transactionService.getTransaction(tranId);
        return ResponseEntity.ok(transaction);
    }
}
