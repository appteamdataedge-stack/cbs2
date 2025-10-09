package com.example.moneymarket.dto;

import com.example.moneymarket.entity.SubProdMaster.SubProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubProductResponseDTO {

    private Integer subProductId;
    private Integer productId;
    private String productCode;
    private String productName;
    private String subProductCode;
    private String subProductName;
    private String inttCode;
    private String cumGLNum;
    private String extGLNum;
    private java.math.BigDecimal interestIncrement;
    private String interestPayableGLNum;
    private String interestIncomeGLNum;
    private java.math.BigDecimal effectiveInterestRate;
    private SubProductStatus subProductStatus;
    private String makerId;
    private LocalDate entryDate;
    private LocalTime entryTime;
    private String verifierId;
    private LocalDate verificationDate;
    private LocalTime verificationTime;
    private boolean verified;
}
