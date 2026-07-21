package com.kingstv.controllers;

import com.kingstv.models.JobPosting;
import com.kingstv.models.JobApplication;
import com.kingstv.repository.JobRepository;
import com.kingstv.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/public/jobs", "/api/v1/public/jobs"})
public class PublicJobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository applicationRepository;

    @GetMapping
    public ResponseEntity<?> getPublicJobs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search) {

        Specification<JobPosting> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("deleted"), false));
            predicates.add(cb.equal(root.get("status"), "active"));

            // Check expiration
            predicates.add(cb.or(
                cb.isNull(root.get("expiresAt")),
                cb.greaterThan(root.get("expiresAt"), LocalDateTime.now())
            ));

            if (category != null && !category.trim().isEmpty()) {
                predicates.add(cb.or(
                    cb.equal(root.get("categoryName"), category),
                    cb.like(cb.lower(root.get("categoryName")), "%" + category.toLowerCase() + "%")
                ));
            }

            if (location != null && !location.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
            }

            if (type != null && !type.trim().isEmpty() && !type.equalsIgnoreCase("all")) {
                predicates.add(cb.equal(root.get("employmentType"), type));
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("companyName")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<JobPosting> list = jobRepository.findAll(spec);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getJobDetail(@PathVariable Long id) {
        Optional<JobPosting> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty() || jobOpt.get().getDeleted()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Job posting not found"));
        }
        return ResponseEntity.ok(jobOpt.get());
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<?> applyToJob(
            @PathVariable Long id,
            @RequestBody JobApplication application) {
        
        Optional<JobPosting> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Job posting not found"));
        }
        
        application.setJobId(id);
        application.setAppliedAt(LocalDateTime.now());
        application.setApplicationStatus("Applied");
        
        JobApplication saved = applicationRepository.save(application);
        
        // Increment applicant count on job posting
        JobPosting job = jobOpt.get();
        job.setApplicantCount((job.getApplicantCount() != null ? job.getApplicantCount() : 0) + 1);
        jobRepository.save(job);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
