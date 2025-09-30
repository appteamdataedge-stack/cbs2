package com.example.moneymarket.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Acct_Bal")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcctBal {

    @Id
    @Column(name = "Account_No", length = 13)
    private String accountNo;

    @OneToOne
    @MapsId
    @JoinColumn(name = "Account_No")
    private CustAcctMaster account;

    @Column(name = "Current_Balance", nullable = false, precision = 20, scale = 2)
    private BigDecimal currentBalance;

    @Column(name = "Available_Balance", nullable = false, precision = 20, scale = 2)
    private BigDecimal availableBalance;

    @Column(name = "Last_Updated", nullable = false)
    private LocalDateTime lastUpdated;
}
