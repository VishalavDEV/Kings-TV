package com.kingstv.services;

import com.kingstv.models.ProfanityWord;
import com.kingstv.models.ProfanityViolation;
import com.kingstv.repository.ProfanityWordRepository;
import com.kingstv.repository.ProfanityViolationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ProfanityService {

    @Autowired
    private ProfanityWordRepository wordRepo;

    @Autowired
    private ProfanityViolationRepository violationRepo;

    public static class ProfanityCheckResult {
        private final boolean clean;
        private final List<String> matchedTerms;

        public ProfanityCheckResult(boolean clean, List<String> matchedTerms) {
            this.clean = clean;
            this.matchedTerms = matchedTerms;
        }

        public boolean isClean() { return clean; }
        public List<String> getMatchedTerms() { return matchedTerms; }
    }

    public List<String> findMatchedTerms(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        List<ProfanityWord> terms = wordRepo.findAll();
        List<String> matched = new ArrayList<>();
        String lowerText = text.toLowerCase();
        
        for (ProfanityWord word : terms) {
            String term = word.getTerm().toLowerCase();
            if (lowerText.contains(term)) {
                matched.add(word.getTerm());
            }
        }
        return matched;
    }

    public ProfanityCheckResult checkContent(String type, Long contentId, String title, Long authorId, String authorEmail, String titleTa, String titleEn, String contentTa, String contentEn) {
        StringBuilder sb = new StringBuilder();
        if (title != null) sb.append(title).append(" ");
        if (titleTa != null) sb.append(titleTa).append(" ");
        if (titleEn != null) sb.append(titleEn).append(" ");
        if (contentTa != null) sb.append(contentTa).append(" ");
        if (contentEn != null) sb.append(contentEn).append(" ");
        
        List<String> matched = findMatchedTerms(sb.toString());
        if (!matched.isEmpty()) {
            logViolation(type, contentId, title != null ? title : (titleTa != null ? titleTa : "Untitled"), matched, authorId, authorEmail);
            return new ProfanityCheckResult(false, matched);
        }
        return new ProfanityCheckResult(true, new ArrayList<>());
    }

    public void logViolation(String contentType, Long contentId, String title, List<String> matched, Long authorId, String authorEmail) {
        ProfanityViolation violation = new ProfanityViolation();
        violation.setContentType(contentType);
        violation.setContentId(contentId);
        violation.setContentTitle(title);
        violation.setMatchedTerms(String.join(", ", matched));
        violation.setAuthorId(authorId);
        violation.setAuthorEmail(authorEmail);
        violation.setStatus("PENDING");
        violationRepo.save(violation);
    }
}
