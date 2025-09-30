package com.example.moneymarket.controller;

import com.example.moneymarket.dto.GLSetupResponseDTO;
import com.example.moneymarket.service.GLSetupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for GL Setup operations
 */
@RestController
@RequestMapping("/api/gl-setup")
@RequiredArgsConstructor
public class GLSetupController {

    private final GLSetupService glSetupService;

    /**
     * Get all GL setups by layer ID
     * 
     * @param layerId The layer ID
     * @return List of GL setups
     */
    @GetMapping("/layer/{layerId}")
    public ResponseEntity<List<GLSetupResponseDTO>> getGLSetupsByLayerId(@PathVariable Integer layerId) {
        List<GLSetupResponseDTO> glSetups = glSetupService.getGLSetupsByLayerId(layerId);
        return ResponseEntity.ok(glSetups);
    }
}
