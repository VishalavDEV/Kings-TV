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

    @GetMapping
    public ResponseEntity<List<Obituary>> getAllObituaries() {
        return ResponseEntity.ok(obituaryRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createObituary(@RequestBody Obituary obit) {
        if (obit.getDeceasedName() == null || obit.getDeceasedName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Deceased Name is required"));
        }
        obit.setCreatedAt(LocalDateTime.now());
        obit.setUpdatedAt(LocalDateTime.now());
        if (obit.getStatus() == null) {
            obit.setStatus("published");
        }
        obit.syncCompatibleFields();
        Obituary saved = obituaryRepository.save(obit);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateObituary(@PathVariable Long id, @RequestBody Obituary entity) {
        Optional<Obituary> obitOpt = obituaryRepository.findById(id);
        if (obitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Obituary not found"));
        }
        
        Obituary obit = obitOpt.get();
        obit.setDeceasedName(entity.getDeceasedName());
        obit.setPhoto(entity.getPhoto());
        obit.setDateOfBirth(entity.getDateOfBirth());
        obit.setDateOfPassing(entity.getDateOfPassing());
        obit.setDemiseDate(entity.getDateOfPassing());
        obit.setAge(entity.getAge());
        obit.setGender(entity.getGender());
        obit.setReligion(entity.getReligion());
        obit.setNativePlace(entity.getNativePlace());
        obit.setLocation(entity.getLocation());
        obit.setFuneralVenue(entity.getFuneralVenue());
        obit.setFuneralDatetime(entity.getFuneralDatetime());
        obit.setMapLink(entity.getMapLink());
        obit.setBiography(entity.getBiography());
        obit.setShortDescription(entity.getBiography());
        obit.setFamilyContactName(entity.getFamilyContactName());
        obit.setFamilyPhone(entity.getFamilyPhone());
        obit.setPosterRelationship(entity.getPosterRelationship());
        obit.setStatus(entity.getStatus());
        obit.setUpdatedAt(LocalDateTime.now());
        
        obit.syncCompatibleFields();
        Obituary updated = obituaryRepository.save(obit);
        return ResponseEntity.ok(updated);
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
}
