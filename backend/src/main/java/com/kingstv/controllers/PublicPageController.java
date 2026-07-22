package com.kingstv.controllers;

import com.kingstv.models.CustomPage;
import com.kingstv.repository.CustomPageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping({"/api/v1/public/pages", "/api/public/pages"})
@CrossOrigin(origins = "*")
public class PublicPageController {

    @Autowired
    private CustomPageRepository customPageRepository;

    @GetMapping
    public ResponseEntity<List<CustomPage>> getPublicPages() {
        List<CustomPage> publicPages = customPageRepository.findByVisibility("Public");
        return ResponseEntity.ok(publicPages);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<?> getPageBySlug(@PathVariable String slug) {
        Optional<CustomPage> pageOpt = customPageRepository.findBySlug(slug);
        if (pageOpt.isPresent()) {
            CustomPage page = pageOpt.get();
            if ("Public".equalsIgnoreCase(page.getVisibility())) {
                return ResponseEntity.ok(page);
            }
        }
        return ResponseEntity.notFound().build();
    }
}
