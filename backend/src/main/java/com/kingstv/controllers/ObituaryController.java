package com.kingstv.controllers;

import com.kingstv.models.*;
import com.kingstv.services.ObituaryService;
import com.kingstv.repository.DistrictRepository;
import com.kingstv.repository.ObituaryFrameTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/obituaries", "/api/v1/obituaries"})
public class ObituaryController {

    @Autowired
    private ObituaryService obituaryService;

    @Autowired
    private ObituaryFrameTemplateRepository frameTemplateRepository;

    @Autowired
    private DistrictRepository districtRepository;

    @GetMapping
    public ResponseEntity<?> getObituaries(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Obituary> obituaries = obituaryService.getObituaries(search, districtId, status, pincode, sort, pageable);
        return ResponseEntity.ok(obituaries.getContent());
    }

    @GetMapping("/trending")
    public ResponseEntity<?> getTrendingMemorials(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Obituary> obits = obituaryService.getObituaries(null, null, "published", null, "popular", PageRequest.of(page, size));
        return ResponseEntity.ok(obits.getContent());
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecentMemorials(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Obituary> obits = obituaryService.getObituaries(null, null, "published", null, "newest", PageRequest.of(page, size));
        return ResponseEntity.ok(obits.getContent());
    }

    @GetMapping("/nearby")
    public ResponseEntity<?> getNearbyMemorials(
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(defaultValue = "50.0") Double radius) {
        List<Obituary> obits = obituaryService.getNearbyMemorials(lat, lon, radius);
        return ResponseEntity.ok(obits);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchObituaries(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Obituary> obits = obituaryService.getObituaries(query, null, "published", null, "newest", PageRequest.of(page, size));
        return ResponseEntity.ok(obits.getContent());
    }

    @GetMapping("/filter")
    public ResponseEntity<?> filterObituaries(
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Obituary> obits = obituaryService.getObituaries(null, districtId, "published", pincode, sort, PageRequest.of(page, size));
        return ResponseEntity.ok(obits.getContent());
    }

    @GetMapping("/frames")
    public ResponseEntity<?> getFrames() {
        return ResponseEntity.ok(frameTemplateRepository.findByIsActiveTrueOrderByDisplayOrderAsc());
    }

    // --- Dynamic File Upload ---
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
        }
        try {
            Path uploadPath = Paths.get("uploads/obituaries");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String contentType = file.getContentType();
            String extension = ".jpg";
            if (contentType != null && contentType.equals("image/png")) {
                extension = ".png";
            }
            String fileName = "obit_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000) + extension;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return ResponseEntity.ok(Map.of("url", "/uploads/obituaries/" + fileName));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload image: " + e.getMessage()));
        }
    }

    // Put /{id} dynamic path mappings at the very bottom
    @GetMapping("/{id}")
    public ResponseEntity<?> getObituaryById(@PathVariable Long id) {
        Optional<Obituary> obitOpt = obituaryService.getObituaryById(id);
        if (obitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Memorial not found"));
        }
        Obituary obit = obitOpt.get();

        Map<String, Object> details = new HashMap<>();
        details.put("id", obit.getId());
        details.put("uuid", obit.getUuid());
        details.put("deceasedName", obit.getDeceasedName());
        details.put("photo", obit.getPhoto());
        details.put("age", obit.getAge());
        details.put("gender", obit.getGender());
        details.put("dateOfBirth", obit.getDateOfBirth());
        details.put("dateOfPassing", obit.getDateOfPassing());
        details.put("demiseDate", obit.getDemiseDate());
        details.put("religion", obit.getReligion());
        details.put("nativePlace", obit.getNativePlace());
        details.put("location", obit.getLocation());
        details.put("district", obit.getDistrict());
        details.put("talukId", obit.getTalukId());
        details.put("pincode", obit.getPincode());
        details.put("latitude", obit.getLatitude());
        details.put("longitude", obit.getLongitude());
        details.put("funeralDatetime", obit.getFuneralDatetime());
        details.put("funeralVenue", obit.getFuneralVenue());
        details.put("funeralDetails", obit.getFuneralDetails());
        details.put("mapLink", obit.getMapLink());
        details.put("familyContactName", obit.getFamilyContactName());
        details.put("familyPhone", obit.getFamilyPhone());
        details.put("posterRelationship", obit.getPosterRelationship());
        details.put("biography", obit.getBiography());
        details.put("shortDescription", obit.getShortDescription());
        details.put("frameTemplate", obit.getFrameTemplate());
        details.put("tributeCount", obit.getTributeCount());
        details.put("guestbookCount", obit.getGuestbookCount());
        details.put("reportCount", obit.getReportCount());
        details.put("status", obit.getStatus());
        details.put("createdAt", obit.getCreatedAt());

        details.put("gallery", obituaryService.getObituaryGallery(obit.getId()));
        details.put("guestbook", obituaryService.getObituaryGuestbook(obit.getId()));

        return ResponseEntity.ok(details);
    }

    @PostMapping
    public ResponseEntity<?> createObituary(@RequestBody Map<String, Object> request) {
        String deceasedName = (String) request.get("deceasedName");
        Integer age = request.get("age") != null ? Integer.valueOf(request.get("age").toString()) : null;
        String biography = (String) request.get("biography");

        if (deceasedName == null || deceasedName.trim().isEmpty() ||
            age == null || biography == null || biography.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name, age, and biography are required."));
        }

        Obituary obit = new Obituary();
        obit.setDeceasedName(deceasedName);
        obit.setAge(age);
        obit.setBiography(biography);

        obit.setPhoto((String) request.get("photo"));
        obit.setGender((String) request.get("gender"));
        obit.setReligion((String) request.get("religion"));
        obit.setNativePlace((String) request.get("nativePlace"));
        obit.setPincode((String) request.get("pincode"));
        obit.setFuneralVenue((String) request.get("funeralVenue"));
        obit.setMapLink((String) request.get("mapLink"));
        obit.setFamilyContactName((String) request.get("familyContactName"));
        obit.setFamilyPhone((String) request.get("familyPhone"));
        obit.setPosterRelationship((String) request.get("posterRelationship"));
        obit.setStatus("published");

        if (request.containsKey("dateOfBirth") && request.get("dateOfBirth") != null) {
            obit.setDateOfBirth(LocalDate.parse(request.get("dateOfBirth").toString()));
        }
        if (request.containsKey("dateOfPassing") && request.get("dateOfPassing") != null) {
            obit.setDateOfPassing(LocalDate.parse(request.get("dateOfPassing").toString()));
        }
        if (request.containsKey("districtId") && request.get("districtId") != null) {
            Long dId = Long.valueOf(request.get("districtId").toString());
            districtRepository.findById(dId).ifPresent(obit::setDistrict);
        }
        if (request.containsKey("frameTemplateId") && request.get("frameTemplateId") != null) {
            Long fId = Long.valueOf(request.get("frameTemplateId").toString());
            frameTemplateRepository.findById(fId).ifPresent(obit::setFrameTemplate);
        }
        if (request.containsKey("funeralDatetime") && request.get("funeralDatetime") != null) {
            obit.setFuneralDatetime(LocalDateTime.parse(request.get("funeralDatetime").toString()));
        }
        if (request.containsKey("latitude") && request.get("latitude") != null) {
            obit.setLatitude(Double.valueOf(request.get("latitude").toString()));
        }
        if (request.containsKey("longitude") && request.get("longitude") != null) {
            obit.setLongitude(Double.valueOf(request.get("longitude").toString()));
        }

        List<String> galleryUrls = (List<String>) request.get("galleryUrls");
        Obituary saved = obituaryService.createObituary(obit, galleryUrls);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateObituary(@PathVariable Long id, @RequestBody Obituary obituary) {
        try {
            Obituary updated = obituaryService.updateObituary(id, obituary);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteObituary(@PathVariable Long id) {
        try {
            obituaryService.deleteObituary(id);
            return ResponseEntity.ok(Map.of("message", "Obituary soft-deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/tribute")
    public ResponseEntity<?> payTribute(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String sessionId,
            @RequestParam(defaultValue = "Tribute") String type) {
        try {
            ObituaryTribute tribute = obituaryService.addTribute(id, userId, sessionId, type);
            return ResponseEntity.ok(tribute);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/guestbook")
    public ResponseEntity<?> addGuestbookMessage(
            @PathVariable Long id,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) Long userId,
            @RequestParam String visitorName,
            @RequestParam String text) {
        try {
            ObituaryGuestbook gb = obituaryService.addGuestbookMessage(id, parentId, userId, visitorName, text);
            return ResponseEntity.ok(gb);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/guestbook/{id}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long id,
            @RequestParam String text,
            @RequestParam(required = false) Long userId) {
        try {
            ObituaryGuestbook gb = obituaryService.updateComment(id, text, userId);
            return ResponseEntity.ok(gb);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/guestbook/{id}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        try {
            obituaryService.deleteComment(id, userId);
            return ResponseEntity.ok(Map.of("message", "Guestbook message deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<?> logView(@PathVariable Long id, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        obituaryService.logView(id, ipAddress, userAgent);
        return ResponseEntity.ok(Map.of("message", "View logged successfully"));
    }

    @PostMapping("/{id}/report")
    public ResponseEntity<?> logReport(
            @PathVariable Long id,
            @RequestParam String reporterName,
            @RequestParam String reason) {
        obituaryService.logReport(id, reporterName, reason);
        return ResponseEntity.ok(Map.of("message", "Report logged successfully"));
    }

    @PostMapping("/{id}/share-card")
    public ResponseEntity<?> logShareCard(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("message", "Share card logged successfully"));
    }
}
