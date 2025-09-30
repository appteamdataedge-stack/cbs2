package com.example.moneymarket.controller;

import com.example.moneymarket.service.InterestAccrualService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for administrative operations
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final InterestAccrualService interestAccrualService;

    /**
     * Run End of Day (EOD) process manually
     * 
     * @param date Optional date to run EOD for (defaults to current date)
     * @return The response with number of processed accounts
     */
    @PostMapping("/run-eod")
    public ResponseEntity<Map<String, Object>> runEOD(
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        LocalDate eodDate = date != null ? date : LocalDate.now();
        int processedCount = interestAccrualService.runEODAccruals(eodDate);
        
        Map<String, Object> response = new HashMap<>();
        response.put("date", eodDate);
        response.put("processedCount", processedCount);
        response.put("status", "Completed");
        
        return ResponseEntity.ok(response);
    }
}
