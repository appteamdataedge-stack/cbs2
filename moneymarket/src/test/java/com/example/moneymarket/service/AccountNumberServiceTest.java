package com.example.moneymarket.service;

import com.example.moneymarket.entity.AccountSeq;
import com.example.moneymarket.exception.BusinessException;
import com.example.moneymarket.repository.AccountSeqRepository;
import com.example.moneymarket.repository.GLSetupRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AccountNumberServiceTest {

    @Mock
    private AccountSeqRepository accountSeqRepository;

    @Mock
    private GLSetupRepository glSetupRepository;

    @InjectMocks
    private AccountNumberService accountNumberService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void generateAccountNumber_Success() {
        // Arrange
        String glNum = "110101001";
        AccountSeq accountSeq = new AccountSeq();
        accountSeq.setGlNum(glNum);
        accountSeq.setSeqNumber(1);
        accountSeq.setLastUpdated(LocalDateTime.now());

        when(glSetupRepository.existsById(glNum)).thenReturn(true);
        when(accountSeqRepository.findByGlNumWithLock(glNum)).thenReturn(Optional.of(accountSeq));
        when(accountSeqRepository.save(any(AccountSeq.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        String accountNumber = accountNumberService.generateAccountNumber(glNum);

        // Assert
        assertNotNull(accountNumber);
        assertEquals(glNum + "002", accountNumber);
        verify(accountSeqRepository).findByGlNumWithLock(glNum);
        verify(accountSeqRepository).save(accountSeq);
        assertEquals(2, accountSeq.getSeqNumber());
    }

    @Test
    void generateAccountNumber_InitializeSequence() {
        // Arrange
        String glNum = "110101001";

        when(glSetupRepository.existsById(glNum)).thenReturn(true);
        when(accountSeqRepository.findByGlNumWithLock(glNum)).thenReturn(Optional.empty());
        when(accountSeqRepository.save(any(AccountSeq.class))).thenAnswer(invocation -> {
            AccountSeq savedSeq = invocation.getArgument(0);
            savedSeq.setSeqNumber(1);
            return savedSeq;
        });

        // Act
        String accountNumber = accountNumberService.generateAccountNumber(glNum);

        // Assert
        assertNotNull(accountNumber);
        assertEquals(glNum + "001", accountNumber);
        verify(accountSeqRepository).findByGlNumWithLock(glNum);
        verify(accountSeqRepository).save(any(AccountSeq.class));
    }

    @Test
    void generateAccountNumber_InvalidGLNumber() {
        // Arrange
        String glNum = "999999999";

        when(glSetupRepository.existsById(glNum)).thenReturn(false);

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            accountNumberService.generateAccountNumber(glNum);
        });

        assertEquals("Cannot generate account number: GL Number " + glNum + " does not exist", exception.getMessage());
        verify(accountSeqRepository, never()).findByGlNumWithLock(anyString());
        verify(accountSeqRepository, never()).save(any(AccountSeq.class));
    }

    @Test
    void generateAccountNumber_SequenceOverflow() {
        // Arrange
        String glNum = "110101001";
        AccountSeq accountSeq = new AccountSeq();
        accountSeq.setGlNum(glNum);
        accountSeq.setSeqNumber(999);
        accountSeq.setLastUpdated(LocalDateTime.now());

        when(glSetupRepository.existsById(glNum)).thenReturn(true);
        when(accountSeqRepository.findByGlNumWithLock(glNum)).thenReturn(Optional.of(accountSeq));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            accountNumberService.generateAccountNumber(glNum);
        });

        assertEquals("Account number sequence for GL " + glNum + " has reached its maximum (999)", exception.getMessage());
        verify(accountSeqRepository).findByGlNumWithLock(glNum);
        verify(accountSeqRepository, never()).save(any(AccountSeq.class));
    }
}
