package com.kingstv.controllers;

import com.kingstv.models.CommodityPrice;
import com.kingstv.repository.CommodityPriceRepository;
import com.kingstv.security.RequiresPermission;
import com.kingstv.models.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/market-prices")
public class CommodityPriceController {

    @Autowired
    private CommodityPriceRepository repository;

    // Public list endpoint
    @GetMapping("/public")
    public ResponseEntity<?> listPublicPrices() {
        return ResponseEntity.ok(repository.findAll());
    }

    // Admin endpoints
    @GetMapping
    @RequiresPermission(anyOf = {Role.SUPER_ADMIN, Role.CHIEF_EDITOR})
    public ResponseEntity<?> listAllPrices() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    @RequiresPermission(anyOf = {Role.SUPER_ADMIN, Role.CHIEF_EDITOR})
    public ResponseEntity<?> createPrice(@RequestBody CommodityPrice item) {
        if (item.getName() == null || item.getPrice() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name and price are required."));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(item));
    }

    @PutMapping("/{id}")
    @RequiresPermission(anyOf = {Role.SUPER_ADMIN, Role.CHIEF_EDITOR})
    public ResponseEntity<?> updatePrice(@PathVariable Long id, @RequestBody CommodityPrice updated) {
        return repository.findById(id).map(item -> {
            if (updated.getName() != null) item.setName(updated.getName());
            if (updated.getPrice() != null) item.setPrice(updated.getPrice());
            return ResponseEntity.ok((Object) repository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(anyOf = {Role.SUPER_ADMIN, Role.CHIEF_EDITOR})
    public ResponseEntity<?> deletePrice(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Market price commodity deleted successfully"));
    }
}
