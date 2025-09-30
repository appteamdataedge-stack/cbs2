package com.example.moneymarket.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "GL_Movement_Accrual")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GLMovementAccrual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Movement_Id")
    private Long movementId;

    @ManyToOne
    @JoinColumn(name = "Accr_Id", nullable = false)
    private InttAccrTran accrual;

    @ManyToOne
    @JoinColumn(name = "GL_Num", nullable = false)
    private GLSetup glSetup;

    @Enumerated(EnumType.STRING)
    @Column(name = "Dr_Cr_Flag", nullable = false)
    private TranTable.DrCrFlag drCrFlag;

    @Column(name = "Accrual_Date", nullable = false)
    private LocalDate accrualDate;

    @Column(name = "Amount", nullable = false, precision = 20, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private InttAccrTran.AccrualStatus status;
}
