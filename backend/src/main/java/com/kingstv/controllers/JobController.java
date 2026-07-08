package com.kingstv.controllers;

import com.kingstv.models.JobPosting;
import com.kingstv.models.JobApplication;
import com.kingstv.repository.JobRepository;
import com.kingstv.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import com.kingstv.repository.SpecificationBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    // --- KEEP Existing Front-End Endpoint Map ---
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
        if (job.getCreatedAt() == null) {
            job.setCreatedAt(LocalDateTime.now());
        }
        JobPosting saved = jobRepository.save(job);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/{jobId}/apply")
    public ResponseEntity<?> applyToJob(@PathVariable Long jobId, @RequestBody JobApplication application) {
        Optional<JobPosting> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Job posting not found"));
        }
        if (application.getApplicantName() == null || application.getApplicantPhone() == null || application.getExperience() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "name, phone and experience are required"));
        }
        application.setJobId(jobId);
        application.setAppliedAt(LocalDateTime.now());
        JobApplication saved = jobApplicationRepository.save(application);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // --- NEW Standardized API Standard Endpoints ---
    @GetMapping("/getAll")
    public Page<JobPosting> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = Sort.by(direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<JobPosting> spec = SpecificationBuilder.build(search, status, null, null);
        return jobRepository.findAll(spec, pageable);
    }

    @GetMapping("/getAllWeb")
    public Page<JobPosting> getAllWeb(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        return getAll(search, "active", page, size, sortBy, direction);
    }

    @PostMapping("/saveUpdate")
    public ResponseEntity<?> save(@RequestBody JobPosting entity) {
        return createJob(entity);
    }

    @PutMapping("/saveUpdate")
    public ResponseEntity<?> update(@RequestBody JobPosting entity) {
        if (entity.getId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Id is required for update"));
        }
        Optional<JobPosting> jobOpt = jobRepository.findById(entity.getId());
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Job posting not found"));
        }
        JobPosting job = jobOpt.get();
        job.setTitle(entity.getTitle());
        job.setCompanyName(entity.getCompanyName());
        job.setCategory(entity.getCategory());
        job.setLocation(entity.getLocation());
        job.setSalaryRange(entity.getSalaryRange());
        job.setEmploymentType(entity.getEmploymentType());
        job.setDescription(entity.getDescription());
        job.setStatus(entity.getStatus());
        
        JobPosting updated = jobRepository.save(job);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/changeStatus")
    public ResponseEntity<?> changeStatus(@RequestBody Map<String, Object> request) {
        if (!request.containsKey("id") || !request.containsKey("status")) {
            return ResponseEntity.badRequest().body(Map.of("message", "id and status are required"));
        }
        Long id = Long.valueOf(request.get("id").toString());
        String status = request.get("status").toString();
        
        Optional<JobPosting> opt = jobRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Job posting not found"));
        }
        JobPosting existing = opt.get();
        existing.setStatus(status);
        jobRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Status updated successfully", "id", id, "status", status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        Optional<JobPosting> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Job posting not found"));
        }
        JobPosting existing = jobOpt.get();
        existing.setStatus("deleted"); // Soft delete
        jobRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Job soft-deleted successfully"));
    }
}
