package com.kingstv.controllers;

import com.kingstv.models.Obituary;
import com.kingstv.models.Condolence;
import com.kingstv.repository.ObituaryRepository;
import com.kingstv.repository.CondolenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/public/obituaries", "/api/v1/public/obituaries"})
public class PublicObituariesController {

    @Autowired
    private ObituaryRepository obituaryRepository;

    @Autowired
    private CondolenceRepository condolenceRepository;

    @GetMapping
    public ResponseEntity<List<Obituary>> getPublishedObituaries() {
        List<Obituary> all = obituaryRepository.findAll();
        List<Obituary> published = new ArrayList<>();
        for (Obituary ob : all) {
            if ("published".equalsIgnoreCase(ob.getStatus()) && !Boolean.TRUE.equals(ob.getDeleted())) {
                published.add(ob);
            }
        }
        return ResponseEntity.ok(published);
    }

    @PostMapping
    public ResponseEntity<?> submitObituary(@RequestBody Obituary obit) {
        if (obit.getDeceasedName() == null || obit.getDeceasedName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Deceased Name is required"));
        }
        obit.setCreatedAt(LocalDateTime.now());
        obit.setUpdatedAt(LocalDateTime.now());
        // default status is pending until approved by an admin
        obit.setStatus("pending");
        obit.syncCompatibleFields();
        Obituary saved = obituaryRepository.save(obit);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getObituaryDetails(@PathVariable Long id) {
        Optional<Obituary> obitOpt = obituaryRepository.findById(id);
        if (obitOpt.isEmpty() || Boolean.TRUE.equals(obitOpt.get().getDeleted())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Obituary not found"));
        }
        return ResponseEntity.ok(obitOpt.get());
    }

    @PostMapping("/{id}/condolences")
    public ResponseEntity<?> submitCondolence(@PathVariable Long id, @RequestBody Condolence cond) {
        Optional<Obituary> obitOpt = obituaryRepository.findById(id);
        if (obitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Obituary profile not found"));
        }
        if (cond.getName() == null || cond.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Visitor Name is required"));
        }
        if (cond.getMessage() == null || cond.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Condolence message is required"));
        }

        cond.setObituaryId(id);
        cond.setCreatedAt(LocalDateTime.now());
        cond.setStatus("pending"); // default status is pending (moderated)
        Condolence saved = condolenceRepository.save(cond);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}/condolences")
    public ResponseEntity<List<Condolence>> getCondolencesForObituary(@PathVariable Long id) {
        // Return only published condolences
        return ResponseEntity.ok(condolenceRepository.findByObituaryIdAndStatus(id, "published"));
    }

    // --- Admin Endpoints to Moderate Condolences ---
    @GetMapping("/condolences/all")
    public ResponseEntity<List<Condolence>> getAllCondolences() {
        return ResponseEntity.ok(condolenceRepository.findAll());
    }

    @PutMapping("/condolences/{condolenceId}/approve")
    public ResponseEntity<?> approveCondolence(@PathVariable Long condolenceId) {
        Optional<Condolence> condOpt = condolenceRepository.findById(condolenceId);
        if (condOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Condolence not found"));
        }
        Condolence cond = condOpt.get();
        cond.setStatus("published");
        condolenceRepository.save(cond);
        return ResponseEntity.ok(Map.of("message", "Condolence approved successfully"));
    }

    @DeleteMapping("/condolences/{condolenceId}")
    public ResponseEntity<?> deleteCondolence(@PathVariable Long condolenceId) {
        Optional<Condolence> condOpt = condolenceRepository.findById(condolenceId);
        if (condOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Condolence not found"));
        }
        condolenceRepository.delete(condOpt.get());
        return ResponseEntity.ok(Map.of("message", "Condolence deleted successfully"));
    }
}
