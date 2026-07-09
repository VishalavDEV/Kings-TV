package com.kingstv.controllers;

import com.kingstv.models.Obituary;
import com.kingstv.repository.ObituaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/obituaries")
public class ObituaryController {

    @Autowired
    private ObituaryRepository obituaryRepository;

    @GetMapping
    public List<Obituary> getObituaries() {
        return obituaryRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getObituaryById(@PathVariable Long id) {
        Optional<Obituary> obitOpt = obituaryRepository.findById(id);
        if (obitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Obituary not found"));
        }
        return ResponseEntity.ok(obitOpt.get());
    }

    @PostMapping
    public ResponseEntity<?> createObituary(@RequestBody Obituary obituary) {
        if (obituary.getDeceasedName() == null || obituary.getAge() == null || obituary.getLocation() == null || obituary.getDemiseDate() == null || obituary.getFuneralDetails() == null || obituary.getShortDescription() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Required fields are missing"));
        }
        Obituary saved = obituaryRepository.save(obituary);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateObituary(@PathVariable Long id, @RequestBody Obituary obituaryDetails) {
        Optional<Obituary> obitOpt = obituaryRepository.findById(id);
        if (obitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Obituary not found"));
        }
        Obituary obituary = obitOpt.get();
        obituary.setDeceasedName(obituaryDetails.getDeceasedName());
        obituary.setAge(obituaryDetails.getAge());
        obituary.setLocation(obituaryDetails.getLocation());
        obituary.setDemiseDate(obituaryDetails.getDemiseDate());
        obituary.setFuneralDetails(obituaryDetails.getFuneralDetails());
        obituary.setShortDescription(obituaryDetails.getShortDescription());
        
        Obituary updated = obituaryRepository.save(obituary);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteObituary(@PathVariable Long id) {
        Optional<Obituary> obitOpt = obituaryRepository.findById(id);
        if (obitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Obituary not found"));
        }
        obituaryRepository.delete(obitOpt.get());
        return ResponseEntity.noContent().build();
    }
}
