package com.kingstv.controllers.admin;

import com.kingstv.models.GalleryAlbum;
import com.kingstv.models.GalleryImage;
import com.kingstv.repository.GalleryAlbumRepository;
import com.kingstv.repository.GalleryImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping({"/api/admin/gallery-albums", "/api/v1/admin/gallery-albums"})
public class AdminGalleryController {

    @Autowired
    private GalleryAlbumRepository albumRepository;

    @Autowired
    private GalleryImageRepository imageRepository;

    @GetMapping
    public ResponseEntity<?> getAllAlbums() {
        List<GalleryAlbum> albums = albumRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (GalleryAlbum album : albums) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", album.getId());
            map.put("albumName", album.getAlbumName());
            map.put("language", album.getLanguage());
            map.put("createdAt", album.getCreatedAt());
            map.put("images", imageRepository.findByAlbumIdOrderByDisplayOrderAsc(album.getId()));
            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> createAlbum(@RequestBody GalleryAlbum album) {
        if (album.getAlbumName() == null || album.getAlbumName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Album name is required"));
        }
        GalleryAlbum saved = albumRepository.save(album);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAlbum(@PathVariable Long id, @RequestBody GalleryAlbum updated) {
        Optional<GalleryAlbum> opt = albumRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        GalleryAlbum album = opt.get();
        if (updated.getAlbumName() != null) album.setAlbumName(updated.getAlbumName());
        if (updated.getLanguage() != null) album.setLanguage(updated.getLanguage());

        GalleryAlbum saved = albumRepository.save(album);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteAlbum(@PathVariable Long id) {
        if (!albumRepository.existsById(id)) return ResponseEntity.notFound().build();

        imageRepository.deleteByAlbumId(id);
        albumRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Album deleted successfully"));
    }

    // --- Images within Album ---

    @GetMapping("/{albumId}/images")
    public ResponseEntity<?> getAlbumImages(@PathVariable Long albumId) {
        return ResponseEntity.ok(imageRepository.findByAlbumIdOrderByDisplayOrderAsc(albumId));
    }

    @PostMapping("/{albumId}/images")
    public ResponseEntity<?> addImageToAlbum(@PathVariable Long albumId, @RequestBody GalleryImage image) {
        if (!albumRepository.existsById(albumId)) return ResponseEntity.notFound().build();

        image.setAlbumId(albumId);
        GalleryImage saved = imageRepository.save(image);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<?> deleteImage(@PathVariable Long imageId) {
        if (!imageRepository.existsById(imageId)) return ResponseEntity.notFound().build();

        imageRepository.deleteById(imageId);
        return ResponseEntity.ok(Map.of("message", "Image removed from album"));
    }
}
