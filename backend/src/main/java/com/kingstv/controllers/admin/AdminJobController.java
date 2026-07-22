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
    public ResponseEntity<?> rejectJob(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<JobPosting> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Job posting not found"));
        }
        JobPosting job = jobOpt.get();
        String reason = request.get("reason");
        job.setStatus("closed");
        job.setRejectionReason(reason);
        job.setUpdatedAt(LocalDateTime.now());
        jobRepository.save(job);
        return ResponseEntity.ok(Map.of("message", "Job posting rejected successfully"));
    }

    @PutMapping("/{id}/more-info")
    public ResponseEntity<?> requestMoreInfo(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<JobPosting> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Job posting not found"));
        }
        JobPosting job = jobOpt.get();
        String note = request.get("note");
        job.setStatus("pending");
        job.setMoreInfoNote(note);
        job.setUpdatedAt(LocalDateTime.now());
        jobRepository.save(job);
        return ResponseEntity.ok(Map.of("message", "Request for more information sent successfully"));
    }

    @GetMapping("/{id}/applications")
    public ResponseEntity<?> getJobApplications(@PathVariable Long id) {
        Optional<JobPosting> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Job posting not found"));
        }
        JobPosting job = jobOpt.get();
        List<JobApplication> apps = applicationRepository.findByJobId(id);
        
        List<Map<String, Object>> responses = new ArrayList<>();
        for (JobApplication app : apps) {
            Map<String, Object> map = new HashMap<>();
            map.put("application", app);
            map.put("compatibilityScore", calculateCompatibility(job, app));
            responses.add(map);
        }
        return ResponseEntity.ok(responses);
    }

    private int calculateCompatibility(JobPosting job, JobApplication app) {
        if (job.getDescription() == null || app.getExperience() == null) {
            return 50; // default baseline
        }
        String reqs = (job.getDescription() + " " + (job.getRequiredSkills() != null ? job.getRequiredSkills() : "")).toLowerCase();
        String candidate = ((app.getExperience() != null ? app.getExperience() : "") + " " + (app.getSummary() != null ? app.getSummary() : "")).toLowerCase();
        
        String[] keywords = {"java", "spring", "react", "angular", "node", "javascript", "sales", "marketing", "manager", "driver", "cooking", "office", "accounting", "retail", "sql", "aws", "python", "finance", "design"};
        int totalKeywords = 0;
        int matchedKeywords = 0;
        
        for (String keyword : keywords) {
            if (reqs.contains(keyword)) {
                totalKeywords++;
                if (candidate.contains(keyword)) {
                    matchedKeywords++;
                }
            }
        }
        if (totalKeywords == 0) {
            return 75; // high baseline if no specific keywords matched
        }
        return Math.min(100, Math.max(30, (matchedKeywords * 100) / totalKeywords));
    }
}
