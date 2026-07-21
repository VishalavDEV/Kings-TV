package com.kingstv.controllers.admin;

import com.kingstv.models.JobPosting;
import com.kingstv.models.JobApplication;
import com.kingstv.repository.JobRepository;
import com.kingstv.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/admin/jobs", "/api/v1/admin/jobs"})
public class AdminJobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository applicationRepository;

    @GetMapping
    public ResponseEntity<List<JobPosting>> getAllJobs() {
        return ResponseEntity.ok(jobRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobPosting job) {
        if (job.getTitle() == null || job.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Job title is required"));
        }
        if (job.getCompanyName() == null || job.getCompanyName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Company name is required"));
        }
        
        job.setCreatedAt(LocalDateTime.now());
        job.setUpdatedAt(LocalDateTime.now());
        if (job.getExpiresAt() == null) {
            job.setExpiresAt(LocalDateTime.now().plusDays(30)); // default 30 days
        }
        JobPosting saved = jobRepository.save(job);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody JobPosting entity) {
        Optional<JobPosting> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Job posting not found"));
        }
        JobPosting job = jobOpt.get();
        job.setTitle(entity.getTitle());
        job.setCompanyName(entity.getCompanyName());
        job.setCategory(entity.getCategory());
        job.setLocation(entity.getLocation());
        job.setJobType(entity.getJobType());
        job.setSalaryMin(entity.getSalaryMin());
        job.setSalaryMax(entity.getSalaryMax());
        job.setDescription(entity.getDescription());
        job.setApplyMethod(entity.getApplyMethod());
        job.setApplyTarget(entity.getApplyTarget());
        job.setStatus(entity.getStatus());
        job.setExpiresAt(entity.getExpiresAt());
        job.setUpdatedAt(LocalDateTime.now());
        
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
        return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveJob(@PathVariable Long id) {
        Optional<JobPosting> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Job posting not found"));
        }
        JobPosting job = jobOpt.get();
        job.setStatus("active");
        job.setUpdatedAt(LocalDateTime.now());
        jobRepository.save(job);
        return ResponseEntity.ok(Map.of("message", "Job posting approved successfully"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectJob(@PathVariable Long id) {
        Optional<JobPosting> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Job posting not found"));
        }
        JobPosting job = jobOpt.get();
        job.setStatus("closed");
        job.setUpdatedAt(LocalDateTime.now());
        jobRepository.save(job);
        return ResponseEntity.ok(Map.of("message", "Job posting rejected successfully"));
    }

    @GetMapping("/{id}/applications")
    public ResponseEntity<?> getJobApplications(@PathVariable Long id) {
        List<JobApplication> apps = applicationRepository.findByJobId(id);
        return ResponseEntity.ok(apps);
    }
}
