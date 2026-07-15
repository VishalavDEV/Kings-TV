package com.kingstv.controllers;

import com.kingstv.models.*;
import com.kingstv.services.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class JobDashboardController {

    @Autowired
    private JobService jobService;

    @PostMapping("/api/resume/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam Long candidateId,
            @RequestParam String fileUrl,
            @RequestParam(required = false) String parsedData,
            @RequestParam(required = false) Integer atsScore) {
        Resume resume = jobService.uploadResume(candidateId, fileUrl, parsedData, atsScore);
        return ResponseEntity.ok(resume);
    }

    @PutMapping("/api/resume/update")
    public ResponseEntity<?> updateResume(
            @RequestParam Long candidateId,
            @RequestParam String fileUrl,
            @RequestParam(required = false) String parsedData,
            @RequestParam(required = false) Integer atsScore) {
        Resume resume = jobService.uploadResume(candidateId, fileUrl, parsedData, atsScore);
        return ResponseEntity.ok(resume);
    }

    @GetMapping("/api/candidate/dashboard")
    public ResponseEntity<?> getCandidateDashboard(@RequestParam Long userId) {
        CandidateProfile profile = jobService.getCandidateProfile(userId);
        List<JobApplication> applications = jobService.getCandidateApplications(profile.getId());
        List<SavedJob> savedJobs = jobService.getSavedJobs(profile.getId());

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("profile", profile);
        dashboard.put("applications", applications);
        dashboard.put("savedJobs", savedJobs);
        dashboard.put("recommendedJobs", List.of()); // AI mock

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/api/employer/dashboard")
    public ResponseEntity<?> getEmployerDashboard(@RequestParam Long recruiterId) {
        List<JobPosting> jobs = jobService.getEmployerJobs(recruiterId);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("jobs", jobs);
        dashboard.put("analytics", Map.of(
            "totalPostings", jobs.size(),
            "totalApplications", jobs.stream().mapToInt(JobPosting::getApplicantCount).sum()
        ));

        return ResponseEntity.ok(dashboard);
    }
}
