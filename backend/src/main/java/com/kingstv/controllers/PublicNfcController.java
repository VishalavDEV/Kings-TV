package com.kingstv.controllers;

import com.kingstv.models.NfcCard;
import com.kingstv.models.NfcTapHistory;
import com.kingstv.repository.NfcCardRepository;
import com.kingstv.repository.NfcTapHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/public/card", "/api/v1/public/card"})
public class PublicNfcController {

    @Autowired
    private NfcCardRepository nfcCardRepository;

    @Autowired
    private NfcTapHistoryRepository nfcTapHistoryRepository;

    private Optional<NfcCard> findCardByUidOrShortCode(String cardUid) {
        Optional<NfcCard> opt = nfcCardRepository.findByCardUid(cardUid);
        if (opt.isPresent()) return opt;
        return nfcCardRepository.findByShortCode(cardUid);
    }

    @GetMapping("/{cardUid}")
    public ResponseEntity<?> getCardDetails(@PathVariable String cardUid) {
        Optional<NfcCard> cardOpt = findCardByUidOrShortCode(cardUid);
        if (cardOpt.isEmpty() || "revoked".equalsIgnoreCase(cardOpt.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "NFC Card not active or revoked"));
        }
        return ResponseEntity.ok(cardOpt.get());
    }

    @PostMapping("/{cardUid}/tap")
    public ResponseEntity<?> logCardTap(
            @PathVariable String cardUid,
            @RequestParam(required = false) String location) {
        Optional<NfcCard> cardOpt = findCardByUidOrShortCode(cardUid);
        if (cardOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "NFC Card not found"));
        }
        
        NfcCard card = cardOpt.get();
        card.setTapCount((card.getTapCount() != null ? card.getTapCount() : 0) + 1);
        nfcCardRepository.save(card);

        NfcTapHistory tap = new NfcTapHistory();
        tap.setCardId(card.getId());
        tap.setTapType("profile");
        tap.setStatus("success");
        tap.setCustomerName("NFC Tapped Reader");
        tap.setLocationCity(location != null && !location.trim().isEmpty() ? location : "Chennai, Tamil Nadu");
        tap.setTappedAt(LocalDateTime.now());
        nfcTapHistoryRepository.save(tap);

        return ResponseEntity.ok(Map.of("message", "Card tap logged successfully", "tapCount", card.getTapCount()));
    }

    @GetMapping("/{cardUid}/vcard")
    public ResponseEntity<byte[]> getVCardFile(@PathVariable String cardUid) {
        Optional<NfcCard> cardOpt = findCardByUidOrShortCode(cardUid);
        if (cardOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        NfcCard card = cardOpt.get();
        
        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCARD\n");
        sb.append("VERSION:3.0\n");
        sb.append("FN:").append(card.getOwnerName() != null ? card.getOwnerName() : "NFC Profile Owner").append("\n");
        if (card.getCompany() != null) {
            sb.append("ORG:").append(card.getCompany()).append("\n");
        }
        if (card.getTitle() != null) {
            sb.append("TITLE:").append(card.getTitle()).append("\n");
        }
        if (card.getPhone() != null) {
            sb.append("TEL;TYPE=CELL:").append(card.getPhone()).append("\n");
        }
        if (card.getEmail() != null) {
            sb.append("EMAIL;TYPE=PREF,INTERNET:").append(card.getEmail()).append("\n");
        }
        if (card.getWebsite() != null) {
            sb.append("URL:").append(card.getWebsite()).append("\n");
        }
        sb.append("END:VCARD\n");

        byte[] vcardBytes = sb.toString().getBytes();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/vcard"));
        headers.setContentDispositionFormData("attachment", "contact.vcf");
        headers.setContentLength(vcardBytes.length);

        return new ResponseEntity<>(vcardBytes, headers, HttpStatus.OK);
    }
}
