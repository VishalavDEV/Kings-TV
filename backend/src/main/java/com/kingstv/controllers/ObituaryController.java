package com.kingstv.controllers;

import com.kingstv.models.Obituary;
import com.kingstv.repository.ObituaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/obituaries")
public class ObituaryController {

    @Autowired
    private ObituaryRepository obituaryRepository;

    @GetMapping
    public List<Obituary> getObituaries() {
        return obituaryRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createObituary(@RequestBody Obituary obituary) {
        if (obituary.getDeceasedName() == null || obituary.getAge() == null || obituary.getLocation() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Required fields are missing"));
        }
        Obituary saved = obituaryRepository.save(obituary);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
