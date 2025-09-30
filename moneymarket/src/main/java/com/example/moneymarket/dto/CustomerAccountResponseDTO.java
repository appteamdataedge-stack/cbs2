package com.example.moneymarket.dto;

import com.example.moneymarket.entity.CustAcctMaster.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAccountResponseDTO {

    private String accountNo;
    private Integer subProductId;
    private String subProductName;
    private String glNum;
    private Integer custId;
    private String custName;
    private String acctName;
    private LocalDate dateOpening;
    private Integer tenor;
    private LocalDate dateMaturity;
    private LocalDate dateClosure;
    private String branchCode;
    private AccountStatus accountStatus;
    private BigDecimal currentBalance;
    private BigDecimal availableBalance;
    
    // Message for UI display (e.g., confirmation messages)
    private String message;
}
