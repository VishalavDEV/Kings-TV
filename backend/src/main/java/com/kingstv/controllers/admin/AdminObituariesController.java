package com.kingstv.controllers.admin;

import com.kingstv.models.Obituary;
import com.kingstv.repository.ObituaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/admin/obituaries", "/api/v1/admin/obituaries"})
public class AdminObituariesController {

    @Autowired
    private ObituaryRepository obituaryRepository;

    @Autowired
    private com.kingstv.repository.ObituaryFrameTemplateRepository obituaryTemplateRepository;

    @Autowired
    private com.kingstv.repository.ObituaryGuestbookRepository obituaryGuestbookRepository;

    @Autowired
    private com.kingstv.repository.AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<List<Obituary>> getAllObituaries() {
        return ResponseEntity.ok(obituaryRepository.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteObituary(@PathVariable Long id) {
        Optional<Obituary> obitOpt = obituaryRepository.findById(id);
        if (obitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Obituary not found"));
        }
        obituaryRepository.delete(obitOpt.get());
        return ResponseEntity.ok(Map.of("message", "Obituary deleted successfully"));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveObituary(@PathVariable Long id) {
        Optional<Obituary> obitOpt = obituaryRepository.findById(id);
        if (obitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Obituary not found"));
        }
        Obituary obit = obitOpt.get();
        obit.setStatus("published");
        obit.setUpdatedAt(LocalDateTime.now());
        obituaryRepository.save(obit);
        return ResponseEntity.ok(Map.of("message", "Obituary approved and published successfully"));
    }

    // --- Templates CRUD ---
    @GetMapping("/templates")
    public ResponseEntity<?> getTemplates() {
        return ResponseEntity.ok(obituaryTemplateRepository.findAll());
    }

    @PostMapping("/templates")
    public ResponseEntity<?> createTemplate(@RequestBody com.kingstv.models.ObituaryFrameTemplate template) {
        if (template.getName() == null || template.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Template name is required"));
        }
        template.setCreatedAt(LocalDateTime.now());
        com.kingstv.models.ObituaryFrameTemplate saved = obituaryTemplateRepository.save(template);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<?> deleteTemplate(@PathVariable Long id) {
        Optional<com.kingstv.models.ObituaryFrameTemplate> opt = obituaryTemplateRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Template not found"));
        }
        obituaryTemplateRepository.delete(opt.get());
        return ResponseEntity.ok(Map.of("message", "Template deleted successfully"));
    }

    // --- Guestbook Moderation ---
    @GetMapping("/guestbook")
    public ResponseEntity<?> getGuestbook() {
        return ResponseEntity.ok(obituaryGuestbookRepository.findAll());
    }

    @DeleteMapping("/guestbook/{id}")
    public ResponseEntity<?> deleteGuestbookEntry(@PathVariable Long id) {
        Optional<com.kingstv.models.ObituaryGuestbook> opt = obituaryGuestbookRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Guestbook entry not found"));
        }
        obituaryGuestbookRepository.delete(opt.get());
        return ResponseEntity.ok(Map.of("message", "Guestbook entry deleted successfully"));
    }

    // --- Contact Details Auditing ---
    @GetMapping("/{id}/unmask-contact")
    public ResponseEntity<?> unmaskContact(@PathVariable Long id) {
        Optional<Obituary> obitOpt = obituaryRepository.findById(id);
        if (obitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Obituary not found"));
        }
        Obituary obit = obitOpt.get();
        
        // Audit this event
        com.kingstv.models.AuditLog audit = new com.kingstv.models.AuditLog();
        audit.setAction("unmask_contact");
        audit.setEntityType("Obituary");
        audit.setEntityId(id);
        audit.setActorId(1L); // Default Admin Actor ID
        audit.setActorRole("ADMIN");
        audit.setDetails("Admin unmasked contact details for Obituary of " + obit.getDeceasedName());
        auditLogRepository.save(audit);
        
        return ResponseEntity.ok(Map.of(
            "familyContactName", obit.getFamilyContactName() != null ? obit.getFamilyContactName() : "N/A",
            "familyPhone", obit.getFamilyPhone() != null ? obit.getFamilyPhone() : "N/A"
        ));
    }
}
