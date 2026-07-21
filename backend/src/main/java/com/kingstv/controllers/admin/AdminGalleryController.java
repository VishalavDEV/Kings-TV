package com.kingstv.controllers.admin;

import com.kingstv.models.GalleryAlbum;
import com.kingstv.models.GalleryImage;
import com.kingstv.repository.GalleryAlbumRepository;
import com.kingstv.repository.GalleryImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/admin/gallery", "/api/v1/admin/gallery", "/api/admin/gallery-albums", "/api/v1/admin/gallery-albums"})
public class AdminGalleryController {

    @Autowired
    private GalleryAlbumRepository albumRepository;

    @Autowired
    private GalleryImageRepository imageRepository;

    // --- ALbum Compatibility Fetch ---
    @GetMapping
    public ResponseEntity<?> getAllAlbums() {
        List<GalleryAlbum> albums = albumRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (GalleryAlbum album : albums) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", album.getId());
            map.put("albumName", album.getAlbumName());
            map.put("language", album.getLanguage());
            map.put("coverImageId", album.getCoverImageId());
            map.put("createdAt", album.getCreatedAt());
            map.put("images", imageRepository.findByAlbumIdOrderByDisplayOrderAsc(album.getId()));
            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    // --- Tab 2: Albums Endpoints ---
    @GetMapping("/albums")
    public ResponseEntity<?> getAlbums(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String language,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Specification<GalleryAlbum> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (language != null && !language.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("language"), language.trim()));
            }

            if (search != null && !search.trim().isEmpty()) {
                String s = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("albumName")), s));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<GalleryAlbum> result = albumRepository.findAll(spec, pageable);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/albums")
    public ResponseEntity<?> createAlbum(@RequestBody GalleryAlbum album) {
        if (album.getAlbumName() == null || album.getAlbumName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Album name is required"));
        }
        album.setCreatedAt(LocalDateTime.now());
        GalleryAlbum saved = albumRepository.save(album);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/albums/{id}")
    public ResponseEntity<?> updateAlbum(@PathVariable Long id, @RequestBody GalleryAlbum updated) {
        Optional<GalleryAlbum> opt = albumRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        GalleryAlbum album = opt.get();
        if (updated.getAlbumName() != null) album.setAlbumName(updated.getAlbumName());
        if (updated.getLanguage() != null) album.setLanguage(updated.getLanguage());
        if (updated.getCoverImageId() != null) album.setCoverImageId(updated.getCoverImageId());

        GalleryAlbum saved = albumRepository.save(album);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/albums/{id}")
    @Transactional
    public ResponseEntity<?> deleteAlbum(
            @PathVariable Long id,
            @RequestParam(required = false) String action
    ) {
        Optional<GalleryAlbum> opt = albumRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        long imageCount = imageRepository.countByAlbumId(id);
        if (imageCount > 0) {
            if (action == null || (!action.equalsIgnoreCase("unassign") && !action.equalsIgnoreCase("cascade"))) {
                Map<String, Object> err = new HashMap<>();
                err.put("error", "ALBUM_NOT_EMPTY");
                err.put("message", "This album contains " + imageCount + " images. Would you like to move these images to 'Unassigned' or delete them all?");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
            }

            if (action.equalsIgnoreCase("unassign")) {
                List<GalleryImage> images = imageRepository.findByAlbumId(id);
                for (GalleryImage img : images) {
                    img.setAlbumId(null);
                }
                imageRepository.saveAll(images);
            } else if (action.equalsIgnoreCase("cascade")) {
                imageRepository.deleteByAlbumId(id);
            }
        }

        albumRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Album deleted successfully"));
    }

    @PutMapping("/albums/{id}/cover")
    public ResponseEntity<?> setAlbumCover(@PathVariable Long id, @RequestParam Long imageId) {
        Optional<GalleryAlbum> opt = albumRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        GalleryAlbum album = opt.get();
        album.setCoverImageId(imageId);
        albumRepository.save(album);
        return ResponseEntity.ok(album);
    }

    // --- Tab 1: Images Endpoints ---
    @GetMapping("/images")
    public ResponseEntity<?> getImages(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Long albumId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Specification<GalleryImage> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (language != null && !language.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("language"), language.trim()));
            }

            if (albumId != null) {
                if (albumId == -1) {
                    predicates.add(cb.isNull(root.get("albumId")));
                } else {
                    predicates.add(cb.equal(root.get("albumId"), albumId));
                }
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("categoryId"), categoryId));
            }

            if (search != null && !search.trim().isEmpty()) {
                String s = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("title")), s));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<GalleryImage> result = imageRepository.findAll(spec, pageable);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/images")
    public ResponseEntity<?> createImage(@RequestBody GalleryImage image) {
        if (image.getFileUrl() == null || image.getFileUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Image file URL is required"));
        }
        image.setCreatedAt(LocalDateTime.now());
        GalleryImage saved = imageRepository.save(image);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/images/{id}")
    public ResponseEntity<?> updateImage(@PathVariable Long id, @RequestBody GalleryImage updated) {
        Optional<GalleryImage> opt = imageRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        GalleryImage image = opt.get();
        if (updated.getTitle() != null) image.setTitle(updated.getTitle());
        if (updated.getLanguage() != null) image.setLanguage(updated.getLanguage());
        if (updated.getFileUrl() != null) image.setFileUrl(updated.getFileUrl());
        image.setAlbumId(updated.getAlbumId());
        image.setCategoryId(updated.getCategoryId());

        GalleryImage saved = imageRepository.save(image);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/images/{id}")
    public ResponseEntity<?> deleteImage(@PathVariable Long id) {
        if (!imageRepository.existsById(id)) return ResponseEntity.notFound().build();

        imageRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Image deleted successfully"));
    }
}
