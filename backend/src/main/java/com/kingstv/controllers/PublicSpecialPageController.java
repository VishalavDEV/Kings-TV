package com.kingstv.controllers;

import com.kingstv.models.CustomPage;
import com.kingstv.models.GeneralApplication;
import com.kingstv.repository.CustomPageRepository;
import com.kingstv.repository.GeneralApplicationRepository;
import com.kingstv.services.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Optional;

@RestController
@RequestMapping("/api/public/pages")
@CrossOrigin(origins = "*")
public class PublicSpecialPageController {

    @Autowired
    private CustomPageRepository customPageRepository;

    @Autowired
    private GeneralApplicationRepository generalApplicationRepository;

    @Autowired
    private StorageService storageService;

    @GetMapping("/{pageType}")
    public ResponseEntity<?> getSpecialPage(
            @PathVariable String pageType,
            @RequestParam(required = false, defaultValue = "ta") String lang) {
        
        Optional<CustomPage> pageOpt = customPageRepository.findByPageTypeAndLanguage(pageType, lang);
        if (pageOpt.isEmpty()) {
            pageOpt = customPageRepository.findByPageType(pageType);
        }

        if (pageOpt.isPresent() && "Public".equalsIgnoreCase(pageOpt.get().getVisibility())) {
            return ResponseEntity.ok(pageOpt.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping(value = "/career/apply", consumes = {"multipart/form-data"})
    public ResponseEntity<?> applyJob(
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "coverLetter", required = false) String coverLetter,
            @RequestParam("resume") MultipartFile resumeFile) {

        if (name == null || name.isBlank() || email == null || email.isBlank() || resumeFile == null || resumeFile.isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Name, email, and resume file are required"));
        }

        try {
            String resumeUrl = storageService.uploadFile(resumeFile, "resumes");

            GeneralApplication application = new GeneralApplication(name, email, phone, coverLetter, resumeUrl);
            GeneralApplication saved = generalApplicationRepository.save(application);

            return ResponseEntity.ok(java.util.Map.of(
                "message", "Application submitted successfully",
                "applicationId", saved.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("message", "Failed to submit application: " + e.getMessage()));
        }
    }
}
