package com.kingstv.controllers;

import com.kingstv.models.PdfContent;
import com.kingstv.repository.PdfRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/pdfs")
public class PdfController {

    @Autowired
    private PdfRepository pdfRepository;

    @GetMapping
    public List<PdfContent> getPdfs() {
        return pdfRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPdfById(@PathVariable Long id) {
        Optional<PdfContent> pdfOpt = pdfRepository.findById(id);
        if (pdfOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "PDF not found"));
        }
        return ResponseEntity.ok(pdfOpt.get());
    }

    @PostMapping
    public ResponseEntity<?> createPdf(@RequestBody PdfContent pdf) {
        if (pdf.getTitle() == null || pdf.getTitleTa() == null || pdf.getPdfUrl() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title, Tamil Title, and PDF URL are required"));
        }
        PdfContent saved = pdfRepository.save(pdf);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePdf(@PathVariable Long id, @RequestBody PdfContent pdfDetails) {
        Optional<PdfContent> pdfOpt = pdfRepository.findById(id);
        if (pdfOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "PDF not found"));
        }
        PdfContent pdf = pdfOpt.get();
        pdf.setTitle(pdfDetails.getTitle());
        pdf.setTitleTa(pdfDetails.getTitleTa());
        pdf.setPdfUrl(pdfDetails.getPdfUrl());
        pdf.setFileSize(pdfDetails.getFileSize());
        
        PdfContent updated = pdfRepository.save(pdf);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePdf(@PathVariable Long id) {
        Optional<PdfContent> pdfOpt = pdfRepository.findById(id);
        if (pdfOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "PDF not found"));
        }
        pdfRepository.delete(pdfOpt.get());
        return ResponseEntity.noContent().build();
    }
}
