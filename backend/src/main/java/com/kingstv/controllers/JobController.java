package com.kingstv.controllers;

import com.kingstv.models.JobPosting;
import com.kingstv.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    @GetMapping
    public List<JobPosting> getJobs() {
        return jobRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        Optional<JobPosting> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Job posting not found"));
        }
        return ResponseEntity.ok(jobOpt.get());
    }

    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobPosting job) {
        if (job.getTitle() == null || job.getCompanyName() == null || job.getCategory() == null || job.getLocation() == null || job.getSalaryRange() == null || job.getDescription() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Required fields are missing"));
        }
        JobPosting saved = jobRepository.save(job);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody JobPosting jobDetails) {
        Optional<JobPosting> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Job posting not found"));
        }
        JobPosting job = jobOpt.get();
        job.setTitle(jobDetails.getTitle());
        job.setCompanyName(jobDetails.getCompanyName());
        job.setCategory(jobDetails.getCategory());
        job.setLocation(jobDetails.getLocation());
        job.setSalaryRange(jobDetails.getSalaryRange());
        job.setEmploymentType(jobDetails.getEmploymentType());
        job.setDescription(jobDetails.getDescription());
        
        JobPosting updated = jobRepository.save(job);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        Optional<JobPosting> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Job posting not found"));
        }
        jobRepository.delete(jobOpt.get());
        return ResponseEntity.noContent().build();
    }
}
