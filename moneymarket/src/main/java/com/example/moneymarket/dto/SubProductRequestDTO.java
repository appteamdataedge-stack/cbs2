package com.example.moneymarket.dto;

import com.example.moneymarket.entity.SubProdMaster.SubProductStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubProductRequestDTO {

    @NotNull(message = "Product ID is mandatory")
    private Integer productId;

    @NotBlank(message = "Sub-Product Code is mandatory")
    @Size(max = 10, message = "Sub-Product Code cannot exceed 10 characters")
    private String subProductCode;

    @NotBlank(message = "Sub-Product Name is mandatory")
    @Size(max = 50, message = "Sub-Product Name cannot exceed 50 characters")
    private String subProductName;

    @Size(max = 10, message = "Interest Code cannot exceed 10 characters")
    private String inttCode;

    @NotBlank(message = "GL Number is mandatory")
    @Size(max = 10, message = "GL Number cannot exceed 10 characters")
    private String cumGLNum;

    @Size(max = 10, message = "External GL Number cannot exceed 10 characters")
    private String extGLNum;

    @NotNull(message = "Sub-Product Status is mandatory")
    private SubProductStatus subProductStatus;

    @NotBlank(message = "Maker ID is mandatory")
    @Size(max = 20, message = "Maker ID cannot exceed 20 characters")
    private String makerId;
}
