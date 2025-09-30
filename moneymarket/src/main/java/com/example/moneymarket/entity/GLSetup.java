package com.example.moneymarket.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "GL_setup")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GLSetup {

    @Column(name = "GL_Name", length = 50)
    private String glName;

    @Column(name = "Layer_Id")
    private Integer layerId;

    @Column(name = "Layer_GL_Num", length = 9)
    private String layerGLNum;

    @Column(name = "Parent_GL_Num", length = 9)
    private String parentGLNum;

    @Id
    @Column(name = "GL_Num", length = 9)
    private String glNum;

    @OneToOne(mappedBy = "glSetup", cascade = CascadeType.ALL)
    private GLBalance balance;
}
