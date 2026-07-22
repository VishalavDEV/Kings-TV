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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCard(@PathVariable Long id) {
        Optional<NfcCard> cardOpt = nfcCardRepository.findById(id);
        if (cardOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "NFC Card not found"));
        }
        nfcCardRepository.delete(cardOpt.get());
        return ResponseEntity.ok(Map.of("message", "NFC Card deleted successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<NfcCard> cardOpt = nfcCardRepository.findById(id);
        if (cardOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "NFC Card not found"));
        }
        NfcCard card = cardOpt.get();
        String nextStatus = request.get("status"); // printing, shipped, activated, revoked
        String currentStatus = card.getStatus() != null ? card.getStatus() : "requested";
        
        // Enforce sequential check
        // requested -> printing -> shipped -> activated (revoked can be transitioned from any state)
        boolean allowed = false;
        if (nextStatus.equalsIgnoreCase("revoked")) {
            allowed = true;
        } else if (currentStatus.equalsIgnoreCase("requested") && nextStatus.equalsIgnoreCase("printing")) {
            allowed = true;
        } else if (currentStatus.equalsIgnoreCase("printing") && nextStatus.equalsIgnoreCase("shipped")) {
            allowed = true;
        } else if (currentStatus.equalsIgnoreCase("shipped") && nextStatus.equalsIgnoreCase("activated")) {
            allowed = true;
        }
        
        if (!allowed) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid status transition from " + currentStatus + " to " + nextStatus));
        }
        
        card.setStatus(nextStatus);
        card.setCardStatus(nextStatus.equalsIgnoreCase("activated") ? "activated" : "blocked"); // legacy field
        
        // When setting to printing, auto-generate cardUid and shortCode if empty
        if (nextStatus.equalsIgnoreCase("printing")) {
            if (card.getCardUid() == null || card.getCardUid().trim().isEmpty()) {
                String generatedUid = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 10);
                card.setCardUid(generatedUid);
                card.setShortCode(generatedUid);
            }
        }
        
        card.setUpdatedAt(LocalDateTime.now());
        nfcCardRepository.save(card);
        
        String targetUrl = "/t/" + card.getShortCode();
        return ResponseEntity.ok(Map.of(
            "message", "NFC Card status updated successfully",
            "card", card,
            "encodeUrl", targetUrl
        ));
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
