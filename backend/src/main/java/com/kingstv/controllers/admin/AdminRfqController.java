package com.kingstv.controllers.admin;

import com.kingstv.models.Rfq;
import com.kingstv.models.RfqQuote;
import com.kingstv.repository.RfqRepository;
import com.kingstv.repository.RfqQuoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/admin/rfq", "/api/v1/admin/rfq"})
public class AdminRfqController {

    @Autowired
    private RfqRepository rfqRepository;

    @Autowired
    private RfqQuoteRepository rfqQuoteRepository;

    @GetMapping
    public ResponseEntity<?> getAllRfqs() {
        List<Rfq> rfqs = rfqRepository.findAll();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Rfq r : rfqs) {
            if ("deleted".equalsIgnoreCase(r.getStatus())) continue;
            List<RfqQuote> quotes = rfqQuoteRepository.findByRfqId(r.getId());
            Map<String, Object> map = new HashMap<>();
            map.put("rfq", r);
            map.put("quotesCount", quotes.size());
            list.add(map);
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> createRfq(@RequestBody Rfq rfq) {
        if (rfq.getTitle() == null || rfq.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title / product_or_service is required"));
        }
        rfq.setCreatedAt(LocalDateTime.now());
        rfq.setUpdatedAt(LocalDateTime.now());
        if (rfq.getStatus() == null) rfq.setStatus("open");
        Rfq saved = rfqRepository.save(rfq);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRfq(@PathVariable Long id, @RequestBody Rfq entity) {
        Optional<Rfq> rfqOpt = rfqRepository.findById(id);
        if (rfqOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "RFQ not found"));
        }
        Rfq rfq = rfqOpt.get();
        rfq.setTitle(entity.getTitle());
        rfq.setProductOrService(entity.getProductOrService());
        rfq.setCategory(entity.getCategory());
        rfq.setBuyerName(entity.getBuyerName());
        rfq.setBuyerContact(entity.getBuyerContact());
        rfq.setQuantity(entity.getQuantity());
        rfq.setBudgetMin(entity.getBudgetMin());
        rfq.setBudgetMax(entity.getBudgetMax());
        rfq.setDescription(entity.getDescription());
        rfq.setLocation(entity.getLocation());
        rfq.setStatus(entity.getStatus());
        rfq.setUpdatedAt(LocalDateTime.now());

        Rfq updated = rfqRepository.save(rfq);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRfq(@PathVariable Long id) {
        Optional<Rfq> rfqOpt = rfqRepository.findById(id);
        if (rfqOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "RFQ not found"));
        }
        rfqRepository.delete(rfqOpt.get());
        return ResponseEntity.ok(Map.of("message", "RFQ deleted successfully"));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<?> closeRfq(@PathVariable Long id) {
        Optional<Rfq> rfqOpt = rfqRepository.findById(id);
        if (rfqOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "RFQ not found"));
        }
        Rfq rfq = rfqOpt.get();
        rfq.setStatus("closed");
        rfq.setUpdatedAt(LocalDateTime.now());
        rfqRepository.save(rfq);
        return ResponseEntity.ok(Map.of("message", "RFQ closed successfully"));
    }

    @GetMapping("/{id}/quotes")
    public ResponseEntity<?> getQuotesForRfq(@PathVariable Long id) {
        List<RfqQuote> quotes = rfqQuoteRepository.findByRfqId(id);
        return ResponseEntity.ok(quotes);
    }
}
