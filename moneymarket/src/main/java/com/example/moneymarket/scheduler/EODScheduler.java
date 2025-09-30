package com.example.moneymarket.scheduler;

import com.example.moneymarket.service.InterestAccrualService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Scheduler for End of Day (EOD) processing
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EODScheduler {

    private final InterestAccrualService interestAccrualService;

    /**
     * Run EOD interest accrual processing
     * Scheduled to run daily at 10 PM
     */
    @Scheduled(cron = "0 0 22 * * ?")
    public void runEODAccrualProcessing() {
        log.info("Starting scheduled EOD interest accrual processing at {}", LocalDateTime.now());
        
        try {
            int processedCount = interestAccrualService.runEODAccruals(LocalDate.now());
            log.info("EOD interest accrual processing completed. Processed {} accounts", processedCount);
        } catch (Exception e) {
            log.error("Error in EOD interest accrual processing", e);
        }
    }
}
