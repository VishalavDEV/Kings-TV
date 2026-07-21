package com.kingstv.controllers.admin;

import com.kingstv.models.NavigationMenu;
import com.kingstv.repository.NavigationMenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/admin/navigation", "/api/v1/admin/navigation"})
public class AdminNavigationController {

    @Autowired
    private NavigationMenuRepository menuRepository;

    @GetMapping
    public ResponseEntity<List<NavigationMenu>> getMenus() {
        return ResponseEntity.ok(menuRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createMenu(@RequestBody NavigationMenu menu) {
        if (menu.getLabel() == null || menu.getLabel().trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Menu label is required");
            return ResponseEntity.badRequest().body(err);
        }
        NavigationMenu saved = menuRepository.save(menu);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenu(@PathVariable Long id, @RequestBody NavigationMenu updatedMenu) {
        Optional<NavigationMenu> existingOpt = menuRepository.findById(id);
        if (existingOpt.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Menu item not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        NavigationMenu existing = existingOpt.get();
        if (updatedMenu.getLabel() != null) existing.setLabel(updatedMenu.getLabel());
        if (updatedMenu.getLink() != null) existing.setLink(updatedMenu.getLink());
        existing.setParentId(updatedMenu.getParentId()); // Allows nullifying parenting
        if (updatedMenu.getLocation() != null) existing.setLocation(updatedMenu.getLocation());
        if (updatedMenu.getMenuOrder() != null) existing.setMenuOrder(updatedMenu.getMenuOrder());

        NavigationMenu saved = menuRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenu(@PathVariable Long id) {
        if (!menuRepository.existsById(id)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Menu item not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
        menuRepository.deleteById(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Menu item deleted successfully");
        return ResponseEntity.ok(res);
    }

    @PutMapping("/reorder")
    public ResponseEntity<?> bulkReorder(@RequestBody List<NavigationMenu> orderedMenus) {
        for (NavigationMenu menu : orderedMenus) {
            Optional<NavigationMenu> opt = menuRepository.findById(menu.getId());
            if (opt.isPresent()) {
                NavigationMenu existing = opt.get();
                existing.setMenuOrder(menu.getMenuOrder());
                existing.setParentId(menu.getParentId());
                menuRepository.save(existing);
            }
        }
        Map<String, String> res = new HashMap<>();
        res.put("message", "Menu order updated successfully");
        return ResponseEntity.ok(res);
    }
}
