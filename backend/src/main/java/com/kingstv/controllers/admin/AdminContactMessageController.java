package com.kingstv.controllers.admin;

import com.kingstv.models.ContactRequest;
import com.kingstv.repository.ContactRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/contact-messages")
public class AdminContactMessageController {

    @Autowired
    private ContactRequestRepository contactRequestRepository;

    @GetMapping
    public ResponseEntity<?> getContactMessages() {
        List<ContactRequest> list = contactRequestRepository.findAll(Sort.by("createdAt").descending());
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteContactMessage(@PathVariable Long id) {
        if (!contactRequestRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        contactRequestRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Contact message deleted"));
    }
}
