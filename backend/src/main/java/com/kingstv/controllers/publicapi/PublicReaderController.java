package com.kingstv.controllers.publicapi;

import com.kingstv.models.Article;
import com.kingstv.models.Reader;
import com.kingstv.models.UgcSubmission;
import com.kingstv.repository.ArticleRepository;
import com.kingstv.repository.ReaderRepository;
import com.kingstv.repository.UgcSubmissionRepository;
import com.kingstv.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
public class PublicReaderController {

    @Autowired
    private ReaderRepository readerRepository;

    @Autowired
    private UgcSubmissionRepository ugcSubmissionRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Reader Google OAuth / SSO Auth Endpoint
     * Creates or updates a Reader account and returns a Reader-scoped JWT.
     */
    @PostMapping("/auth/google")
    public ResponseEntity<?> googleAuth(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        String name = (String) body.get("name");
        String googleId = (String) body.get("googleId");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        String readerName = (name != null && !name.isBlank()) ? name : email.split("@")[0];
        Optional<Reader> existing = readerRepository.findByEmail(email.toLowerCase());

        Reader reader;
        if (existing.isPresent()) {
            reader = existing.get();
            if (googleId != null) reader.setGoogleId(googleId);
            if (name != null && !name.isBlank()) reader.setName(name);
            reader = readerRepository.save(reader);
        } else {
            reader = new Reader(readerName, email.toLowerCase(), googleId, "google");
            reader = readerRepository.save(reader);
        }

        String token = jwtUtil.generateToken(reader.getEmail(), "READER", reader.getId());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", token);
        response.put("reader", toReaderMap(reader));
        return ResponseEntity.ok(response);
    }

    /**
     * Get Current Reader Profile
     */
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Reader reader = resolveReader(authHeader);
        if (reader == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Reader authentication required"));
        }
        return ResponseEntity.ok(toReaderMap(reader));
    }

    /**
     * Update Reader Preferences (Location & Categories)
     */
    @PutMapping("/me/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {

        Reader reader = resolveReader(authHeader);
        if (reader == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Reader authentication required"));
        }

        if (body.containsKey("preferredLocation")) {
            reader.setPreferredLocation((String) body.get("preferredLocation"));
        }
        if (body.containsKey("preferredCategories")) {
            Object cats = body.get("preferredCategories");
            if (cats instanceof List) {
                @SuppressWarnings("unchecked")
                List<?> list = (List<?>) cats;
                reader.setPreferredCategories(list.stream().map(Object::toString).collect(Collectors.joining(",")));
            } else if (cats instanceof String) {
                reader.setPreferredCategories((String) cats);
            }
        }
        if (body.containsKey("name")) {
            reader.setName((String) body.get("name"));
        }

        Reader saved = readerRepository.save(reader);
        return ResponseEntity.ok(toReaderMap(saved));
    }

    /**
     * Submit User-Generated Content (Story)
     * Lands in UgcSubmission queue with source = "reader", status = "PENDING"
     */
    @PostMapping("/submissions")
    public ResponseEntity<?> submitStory(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {

        Reader reader = resolveReader(authHeader);
        String title = (String) body.get("title");
        String content = body.get("content") != null ? (String) body.get("content") : (String) body.get("body");
        String imageUrl = (String) body.get("imageUrl");

        if (title == null || title.isBlank() || content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title and content/body are required"));
        }

        Long categoryId = body.get("categoryId") != null ? ((Number) body.get("categoryId")).longValue() : null;
        Long districtId = body.get("districtId") != null ? ((Number) body.get("districtId")).longValue() : null;

        UgcSubmission submission = new UgcSubmission();
        submission.setTitle(title);
        submission.setContent(content);
        submission.setImageUrl(imageUrl);
        submission.setCategoryId(categoryId);
        submission.setDistrictId(districtId);
        submission.setStatus("PENDING");
        submission.setSource("reader");

        if (reader != null) {
            submission.setSubmitterId(reader.getId());
            submission.setSubmitterName(reader.getName());
            submission.setSubmitterEmail(reader.getEmail());
        } else {
            submission.setSubmitterName((String) body.getOrDefault("submitterName", "Anonymous Reader"));
            submission.setSubmitterEmail((String) body.getOrDefault("submitterEmail", "guest@reader.com"));
        }

        UgcSubmission saved = ugcSubmissionRepository.save(submission);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Story submitted successfully! Sent to moderation queue.",
            "submissionId", saved.getId(),
            "status", saved.getStatus(),
            "source", saved.getSource()
        ));
    }

    /**
     * Personalized Feed for Logged-In Readers
     * Filters published articles based on reader's preferredLocation & preferredCategories.
     */
    @GetMapping("/me/feed")
    public ResponseEntity<?> getPersonalizedFeed(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Reader reader = resolveReader(authHeader);
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("publishedAt").descending());

        List<Article> published = articleRepository.findByStatus("published", pageRequest).getContent();

        if (reader == null) {
            // Unauthenticated: return general published feed
            return ResponseEntity.ok(published);
        }

        // Parse preferred category IDs
        Set<Long> prefCatIds = new HashSet<>();
        if (reader.getPreferredCategories() != null && !reader.getPreferredCategories().isBlank()) {
            for (String part : reader.getPreferredCategories().split(",")) {
                try {
                    prefCatIds.add(Long.parseLong(part.trim()));
                } catch (NumberFormatException ignored) {}
            }
        }

        String prefLoc = reader.getPreferredLocation();

        // Sort / Filter published articles by relevance to preferences
        List<Article> personalized = published.stream()
            .sorted((a1, a2) -> {
                int score1 = calcRelevance(a1, prefCatIds, prefLoc);
                int score2 = calcRelevance(a2, prefCatIds, prefLoc);
                return Integer.compare(score2, score1); // Higher score first
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
            "reader", toReaderMap(reader),
            "feed", personalized,
            "total", personalized.size()
        ));
    }

    // --- Helper Methods ---

    private Reader resolveReader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        try {
            String email = jwtUtil.extractUsername(token);
            if (email == null) return null;
            if (!jwtUtil.validateToken(token, email)) return null;
            return readerRepository.findByEmail(email).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private int calcRelevance(Article article, Set<Long> prefCatIds, String prefLoc) {
        int score = 0;
        if (article.getCategoryId() != null && prefCatIds.contains(article.getCategoryId())) {
            score += 10;
        }
        if (prefLoc != null && !prefLoc.isBlank()) {
            if (article.getConstituency() != null && article.getConstituency().equalsIgnoreCase(prefLoc)) {
                score += 15;
            }
        }
        return score;
    }

    private Map<String, Object> toReaderMap(Reader reader) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", reader.getId());
        map.put("name", reader.getName());
        map.put("email", reader.getEmail());
        map.put("googleId", reader.getGoogleId());
        map.put("authProvider", reader.getAuthProvider());
        map.put("preferredLocation", reader.getPreferredLocation());
        map.put("preferredCategories", reader.getPreferredCategories());
        map.put("createdAt", reader.getCreatedAt());
        return map;
    }
}
