package com.example.moneymarket.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "GL_Balance")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GLBalance {

    @Id
    @Column(name = "GL_Num", length = 9)
    private String glNum;

    @OneToOne
    @MapsId
    @JoinColumn(name = "GL_Num")
    private GLSetup glSetup;

    @Column(name = "Current_Balance", nullable = false, precision = 20, scale = 2)
    private BigDecimal currentBalance;

    @Column(name = "Last_Updated", nullable = false)
    private LocalDateTime lastUpdated;
}
