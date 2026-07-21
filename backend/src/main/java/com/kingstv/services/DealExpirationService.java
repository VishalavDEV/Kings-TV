package com.kingstv.services;

import com.kingstv.models.Deal;
import com.kingstv.repository.DealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;

@Service
@Transactional
public class DealExpirationService {

    private static final Logger LOGGER = Logger.getLogger(DealExpirationService.class.getName());

    @Autowired
    private DealRepository dealRepository;

    // Run automatically every hour to expire deals past valid_until dates
    @Scheduled(cron = "0 0 * * * *")
    public void autoExpireDeals() {
        LOGGER.info("Starting scheduled deal auto-expiration scanning...");
        LocalDateTime now = LocalDateTime.now();
        List<Deal> allDeals = dealRepository.findAll();
        int count = 0;
        for (Deal deal : allDeals) {
            if ("approved".equals(deal.getStatus()) && deal.getValidUntil() != null && deal.getValidUntil().isBefore(now)) {
                deal.setStatus("expired");
                deal.setUpdatedAt(now);
                dealRepository.save(deal);
                count++;
            }
        }
        LOGGER.info("Deal auto-expiration completed. Expired: " + count + " deals.");
    }
}
