package com.kingstv.controllers.admin;

import com.kingstv.models.Widget;
import com.kingstv.repository.WidgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/admin/widgets", "/api/v1/admin/widgets"})
public class AdminWidgetController {

    @Autowired
    private WidgetRepository widgetRepository;

    @GetMapping
    public ResponseEntity<List<Widget>> getWidgets() {
        return ResponseEntity.ok(widgetRepository.findAll());
    }

    @GetMapping("/placement/{placement}")
    public ResponseEntity<List<Widget>> getWidgetsByPlacement(@PathVariable String placement) {
        return ResponseEntity.ok(widgetRepository.findByPlacementOrderByMenuOrderAsc(placement));
    }

    @PostMapping
    public ResponseEntity<?> createWidget(@RequestBody Widget widget) {
        if (widget.getTitle() == null || widget.getTitle().trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Widget title is required");
            return ResponseEntity.badRequest().body(err);
        }
        if (widget.getWidgetType() == null || widget.getWidgetType().trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Widget type is required");
            return ResponseEntity.badRequest().body(err);
        }

        Widget saved = widgetRepository.save(widget);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateWidget(@PathVariable Long id, @RequestBody Widget updatedWidget) {
        Optional<Widget> existingOpt = widgetRepository.findById(id);
        if (existingOpt.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Widget not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        Widget existing = existingOpt.get();
        if (updatedWidget.getTitle() != null) existing.setTitle(updatedWidget.getTitle());
        if (updatedWidget.getWidgetType() != null) existing.setWidgetType(updatedWidget.getWidgetType());
        if (updatedWidget.getConfig() != null) existing.setConfig(updatedWidget.getConfig());
        if (updatedWidget.getPlacement() != null) existing.setPlacement(updatedWidget.getPlacement());
        if (updatedWidget.getMenuOrder() != null) existing.setMenuOrder(updatedWidget.getMenuOrder());

        Widget saved = widgetRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWidget(@PathVariable Long id) {
        if (!widgetRepository.existsById(id)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Widget not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
        widgetRepository.deleteById(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Widget deleted successfully");
        return ResponseEntity.ok(res);
    }

    @PutMapping("/reorder")
    public ResponseEntity<?> bulkReorder(@RequestBody List<Widget> orderedWidgets) {
        for (Widget w : orderedWidgets) {
            Optional<Widget> opt = widgetRepository.findById(w.getId());
            if (opt.isPresent()) {
                Widget existing = opt.get();
                existing.setMenuOrder(w.getMenuOrder());
                existing.setPlacement(w.getPlacement());
                widgetRepository.save(existing);
            }
        }
        Map<String, String> res = new HashMap<>();
        res.put("message", "Widgets reordered successfully");
        return ResponseEntity.ok(res);
    }
}
