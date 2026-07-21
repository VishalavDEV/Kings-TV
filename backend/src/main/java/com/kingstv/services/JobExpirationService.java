package com.kingstv.services;

import com.kingstv.models.JobPosting;
import com.kingstv.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;

@Service
@Transactional
public class JobExpirationService {

    private static final Logger LOGGER = Logger.getLogger(JobExpirationService.class.getName());

    @Autowired
    private JobRepository jobRepository;

    // Run automatically every hour to expire jobs past their deadlines
    @Scheduled(cron = "0 0 * * * *")
    public void autoExpireJobs() {
        LOGGER.info("Starting scheduled job auto-expiration scanning...");
        LocalDateTime now = LocalDateTime.now();
        List<JobPosting> allJobs = jobRepository.findAll();
        int count = 0;
        for (JobPosting job : allJobs) {
            if ("active".equals(job.getStatus()) && job.getExpiresAt() != null && job.getExpiresAt().isBefore(now)) {
                job.setStatus("expired");
                job.setUpdatedAt(now);
                jobRepository.save(job);
                count++;
            }
        }
        LOGGER.info("Job auto-expiration completed. Expired: " + count + " job postings.");
    }
}
