package com.kingstv.controllers.admin;

import com.kingstv.models.Widget;
import com.kingstv.repository.WidgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/admin/widgets", "/api/v1/admin/widgets"})
public class AdminWidgetController {

    @Autowired
    private WidgetRepository widgetRepository;

    @Autowired
    private com.kingstv.services.HtmlSanitizer htmlSanitizer;

    @GetMapping
    public ResponseEntity<?> getWidgets(
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("menuOrder").ascending().and(Sort.by("id").descending()));

        Specification<Widget> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (language != null && !language.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("language"), language.trim()));
            }

            if (search != null && !search.trim().isEmpty()) {
                String s = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), s),
                    cb.like(cb.lower(root.get("content")), s),
                    cb.like(cb.lower(root.get("widgetType")), s)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Widget> result = widgetRepository.findAll(spec, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/placement/{placement}")
    public ResponseEntity<List<Widget>> getWidgetsByPlacement(
            @PathVariable String placement,
            @RequestParam(required = false) String language
    ) {
        Specification<Widget> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("placement"), placement));
            predicates.add(cb.equal(root.get("visibility"), true));

            if (language != null && !language.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("language"), language.trim()));
            }

            query.orderBy(cb.asc(root.get("menuOrder")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return ResponseEntity.ok(widgetRepository.findAll(spec));
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

        if (widget.getContent() != null) {
            widget.setContent(htmlSanitizer.sanitize(widget.getContent()));
        }
        widget.setCreatedAt(LocalDateTime.now());
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
        if (updatedWidget.getLanguage() != null) existing.setLanguage(updatedWidget.getLanguage());
        if (updatedWidget.getVisibility() != null) existing.setVisibility(updatedWidget.getVisibility());
        if (updatedWidget.getContent() != null) {
            existing.setContent(htmlSanitizer.sanitize(updatedWidget.getContent()));
        } else if (existing.getContent() != null) {
            existing.setContent(htmlSanitizer.sanitize(existing.getContent()));
        }

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
