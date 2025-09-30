package com.example.moneymarket.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "Intt_Accr_Tran")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InttAccrTran {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Accr_Id")
    private Long accrId;

    @Column(name = "Tran_Id", nullable = false, length = 20)
    private String tranId;

    @Column(name = "Account_No", nullable = false, length = 13)
    private String accountNo;

    @Column(name = "Accrual_Date", nullable = false)
    private LocalDate accrualDate;

    @Column(name = "Interest_Rate", nullable = false, precision = 10, scale = 4)
    private BigDecimal interestRate;

    @Column(name = "Amount", nullable = false, precision = 20, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private AccrualStatus status;

    @OneToMany(mappedBy = "accrual", cascade = CascadeType.ALL)
    private List<GLMovementAccrual> accrualMovements;

    public enum AccrualStatus {
        Pending, Posted, Verified
    }
}
