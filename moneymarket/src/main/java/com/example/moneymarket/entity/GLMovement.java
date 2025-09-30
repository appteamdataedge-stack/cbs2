package com.example.moneymarket.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "GL_Movement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GLMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Movement_Id")
    private Long movementId;

    @ManyToOne
    @JoinColumn(name = "Tran_Id", nullable = false)
    private TranTable transaction;

    @ManyToOne
    @JoinColumn(name = "GL_Num", nullable = false)
    private GLSetup glSetup;

    @Enumerated(EnumType.STRING)
    @Column(name = "Dr_Cr_Flag", nullable = false)
    private TranTable.DrCrFlag drCrFlag;

    @Column(name = "Tran_Date", nullable = false)
    private LocalDate tranDate;

    @Column(name = "Value_Date", nullable = false)
    private LocalDate valueDate;

    @Column(name = "Amount", nullable = false, precision = 20, scale = 2)
    private BigDecimal amount;

    @Column(name = "Balance_After", nullable = false, precision = 20, scale = 2)
    private BigDecimal balanceAfter;
}
