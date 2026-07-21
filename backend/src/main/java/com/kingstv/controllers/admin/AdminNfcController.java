package com.kingstv.controllers.admin;

import com.kingstv.models.NfcCard;
import com.kingstv.models.NfcTapHistory;
import com.kingstv.repository.NfcCardRepository;
import com.kingstv.repository.NfcTapHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/admin/nfc", "/api/v1/admin/nfc"})
public class AdminNfcController {

    @Autowired
    private NfcCardRepository nfcCardRepository;

    @Autowired
    private NfcTapHistoryRepository nfcTapHistoryRepository;

    @GetMapping
    public ResponseEntity<List<NfcCard>> getAllCards() {
        return ResponseEntity.ok(nfcCardRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createCard(@RequestBody NfcCard card) {
        if (card.getCardUid() == null || card.getCardUid().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Card UID is required"));
        }
        if (card.getOwnerName() == null || card.getOwnerName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Owner Name is required"));
        }
        
        // Auto-generate shortCode if not provided to satisfy legacy column validation
        if (card.getShortCode() == null || card.getShortCode().trim().isEmpty()) {
            card.setShortCode(card.getCardUid());
        }

        card.setCreatedAt(LocalDateTime.now());
        card.setUpdatedAt(LocalDateTime.now());
        card.setTapCount(0);
        card.setStatus("active");
        card.setCardStatus("activated"); // legacy field
        
        NfcCard saved = nfcCardRepository.save(card);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCard(@PathVariable Long id, @RequestBody NfcCard entity) {
        Optional<NfcCard> cardOpt = nfcCardRepository.findById(id);
        if (cardOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "NFC Card not found"));
        }
        
        NfcCard card = cardOpt.get();
        card.setCardUid(entity.getCardUid());
        card.setShortCode(entity.getCardUid()); // keep synced
        card.setOwnerName(entity.getOwnerName());
        card.setTitle(entity.getTitle());
        card.setCompany(entity.getCompany());
        card.setPhone(entity.getPhone());
        card.setEmail(entity.getEmail());
        card.setWebsite(entity.getWebsite());
        card.setSocialLinks(entity.getSocialLinks());
        card.setProfilePhoto(entity.getProfilePhoto());
        card.setCardTemplate(entity.getCardTemplate());
        card.setVcardEnabled(entity.getVcardEnabled());
        card.setStatus(entity.getStatus());
        card.setCardStatus(entity.getStatus().equalsIgnoreCase("active") ? "activated" : "blocked"); // legacy field
        card.setUpdatedAt(LocalDateTime.now());

        NfcCard updated = nfcCardRepository.save(card);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCard(@PathVariable Long id) {
        Optional<NfcCard> cardOpt = nfcCardRepository.findById(id);
        if (cardOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "NFC Card not found"));
        }
        nfcCardRepository.delete(cardOpt.get());
        return ResponseEntity.ok(Map.of("message", "NFC Card deleted successfully"));
    }

    @PutMapping("/{id}/revoke")
    public ResponseEntity<?> revokeCard(@PathVariable Long id) {
        Optional<NfcCard> cardOpt = nfcCardRepository.findById(id);
        if (cardOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "NFC Card not found"));
        }
        NfcCard card = cardOpt.get();
        card.setStatus("revoked");
        card.setCardStatus("blocked"); // legacy field
        card.setUpdatedAt(LocalDateTime.now());
        nfcCardRepository.save(card);
        return ResponseEntity.ok(Map.of("message", "NFC Card status set to revoked"));
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<?> getCardAnalytics(@PathVariable Long id) {
        List<NfcTapHistory> logs = nfcTapHistoryRepository.findByCardId(id);
        return ResponseEntity.ok(logs);
    }
}
