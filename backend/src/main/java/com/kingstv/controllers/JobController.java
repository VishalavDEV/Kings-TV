package com.kingstv.controllers;

import com.kingstv.models.JobPosting;
import com.kingstv.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    @GetMapping
    public List<JobPosting> getJobs() {
        return jobRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobPosting job) {
        if (job.getTitle() == null || job.getCompanyName() == null || job.getCategory() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Required fields are missing"));
        }
        JobPosting saved = jobRepository.save(job);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
