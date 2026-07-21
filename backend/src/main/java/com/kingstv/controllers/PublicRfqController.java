package com.kingstv.controllers;

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
@RequestMapping({"/api/public/rfq", "/api/v1/public/rfq"})
public class PublicRfqController {

    @Autowired
    private RfqRepository rfqRepository;

    @Autowired
    private RfqQuoteRepository rfqQuoteRepository;

    @GetMapping
    public ResponseEntity<?> getPublicOpenRfqs() {
        // Business-facing list of active requests
        List<Rfq> rfqs = rfqRepository.findAll();
        List<Map<String, Object>> activeList = new ArrayList<>();
        for (Rfq r : rfqs) {
            if ("open".equalsIgnoreCase(r.getStatus())) {
                List<RfqQuote> quotes = rfqQuoteRepository.findByRfqId(r.getId());
                Map<String, Object> map = new HashMap<>();
                map.put("rfq", r);
                map.put("quotesCount", quotes.size());
                activeList.add(map);
            }
        }
        return ResponseEntity.ok(activeList);
    }

    @PostMapping
    public ResponseEntity<?> createPublicRfq(@RequestBody Rfq rfq) {
        if (rfq.getProductOrService() == null || rfq.getProductOrService().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product or service name is required"));
        }
        if (rfq.getBuyerName() == null || rfq.getBuyerName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Buyer name is required"));
        }
        if (rfq.getBuyerContact() == null || rfq.getBuyerContact().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Buyer contact details are required"));
        }

        // Set title to product_or_service compatibility
        rfq.setTitle(rfq.getProductOrService());
        rfq.setCreatedAt(LocalDateTime.now());
        rfq.setUpdatedAt(LocalDateTime.now());
        rfq.setStatus("open");
        
        Rfq saved = rfqRepository.save(rfq);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}/quotes")
    public ResponseEntity<?> getQuotesReceived(@PathVariable Long id) {
        // Buyer-facing page showing quotes received per request
        Optional<Rfq> rfqOpt = rfqRepository.findById(id);
        if (rfqOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "RFQ not found"));
        }
        List<RfqQuote> quotes = rfqQuoteRepository.findByRfqId(id);
        return ResponseEntity.ok(quotes);
    }

    @PostMapping("/{id}/quotes")
    public ResponseEntity<?> submitPublicQuote(
            @PathVariable Long id,
            @RequestBody RfqQuote quote) {
        Optional<Rfq> rfqOpt = rfqRepository.findById(id);
        if (rfqOpt.isEmpty() || !"open".equalsIgnoreCase(rfqOpt.get().getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "RFQ request is closed or not available"));
        }
        if (quote.getQuotedPrice() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Quote price is required"));
        }

        quote.setRfqId(id);
        quote.setCreatedAt(LocalDateTime.now());
        quote.setUpdatedAt(LocalDateTime.now());
        quote.setStatus("submitted");
        
        RfqQuote saved = rfqQuoteRepository.save(quote);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/quotes/{quoteId}/accept")
    public ResponseEntity<?> acceptQuote(@PathVariable Long quoteId) {
        Optional<RfqQuote> quoteOpt = rfqQuoteRepository.findById(quoteId);
        if (quoteOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Quote not found"));
        }
        
        RfqQuote quote = quoteOpt.get();
        quote.setStatus("accepted");
        quote.setUpdatedAt(LocalDateTime.now());
        rfqQuoteRepository.save(quote);
        
        // Also update parent RFQ to closed or quoted
        Optional<Rfq> rfqOpt = rfqRepository.findById(quote.getRfqId());
        if (rfqOpt.isPresent()) {
            Rfq rfq = rfqOpt.get();
            rfq.setStatus("closed");
            rfqRepository.save(rfq);
        }
        
        // Auto-reject other quotes for this RFQ
        List<RfqQuote> others = rfqQuoteRepository.findByRfqId(quote.getRfqId());
        for (RfqQuote q : others) {
            if (!q.getId().equals(quoteId)) {
                q.setStatus("rejected");
                rfqQuoteRepository.save(q);
            }
        }

        return ResponseEntity.ok(Map.of("message", "Quote accepted successfully and requirement closed"));
    }
}
