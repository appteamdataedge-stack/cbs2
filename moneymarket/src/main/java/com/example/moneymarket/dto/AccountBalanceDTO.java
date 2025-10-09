package com.example.moneymarket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for account balance information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountBalanceDTO {
    
    private String accountNo;
    private String accountName;
    private BigDecimal availableBalance;
    private BigDecimal currentBalance;
    private BigDecimal todayDebits;
    private BigDecimal todayCredits;
    private BigDecimal computedBalance;
}

