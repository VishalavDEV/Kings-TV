package com.kingstv.controllers;

import com.kingstv.models.Poll;
import com.kingstv.models.PollOption;
import com.kingstv.repository.PollRepository;
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
@RequestMapping({"/api/admin/polls", "/api/v1/admin/polls", "/api/v1/polls"})
public class PollController {

    @Autowired
    private PollRepository pollRepository;

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String language,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Specification<Poll> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            } else {
                predicates.add(cb.notEqual(root.get("status"), "deleted"));
            }

            if (language != null && !language.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("language"), language.trim()));
            }

            if (search != null && !search.trim().isEmpty()) {
                String s = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("question")), s));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Poll> result = pollRepository.findAll(spec, pageable);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Poll poll) {
        if (poll.getQuestion() == null || poll.getQuestion().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Poll question is required"));
        }
        if (poll.getOptions() == null || poll.getOptions().size() < 2) {
            return ResponseEntity.badRequest().body(Map.of("message", "Minimum 2 poll options are required"));
        }

        // Validate options and set their orders
        int orderIndex = 1;
        for (PollOption opt : poll.getOptions()) {
            if (opt.getOptionText() == null || opt.getOptionText().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "All options must have non-empty text"));
            }
            opt.setOptionOrder(orderIndex++);
            opt.setVoteCount(0);
        }

        poll.setVoteCount(0);
        poll.setCreatedAt(LocalDateTime.now());
        poll.setUpdatedAt(LocalDateTime.now());
        Poll saved = pollRepository.save(poll);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Poll poll,
            @RequestParam(defaultValue = "false") boolean confirmOptionDelete
    ) {
        Optional<Poll> opt = pollRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Poll not found"));
        }

        Poll existing = opt.get();

        // 1. Check if any option is deleted that has active votes
        for (PollOption existingOpt : existing.getOptions()) {
            boolean stillExists = poll.getOptions().stream()
                    .anyMatch(o -> o.getId() != null && o.getId().equals(existingOpt.getId()));
            if (!stillExists && existingOpt.getVoteCount() > 0 && !confirmOptionDelete) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "CONFIRM_DELETE");
                errorResponse.put("message", "Option '" + existingOpt.getOptionText() + "' has " + existingOpt.getVoteCount() + " votes. Deleting it will affect results integrity. Do you want to proceed?");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
            }
        }

        // 2. Perform updates
        existing.setQuestion(poll.getQuestion());
        existing.setLanguage(poll.getLanguage());
        existing.setPermission(poll.getPermission());
        existing.setStatus(poll.getStatus());

        // Update option text or insert new ones
        List<PollOption> newOptionsList = new ArrayList<>();
        int orderIndex = 1;
        int totalVotesAccum = 0;

        for (PollOption optionPayload : poll.getOptions()) {
            if (optionPayload.getOptionText() == null || optionPayload.getOptionText().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "All options must have non-empty text"));
            }
            
            PollOption targetOption;
            if (optionPayload.getId() != null) {
                // Find existing option
                Optional<PollOption> match = existing.getOptions().stream()
                        .filter(o -> o.getId().equals(optionPayload.getId()))
                        .findFirst();
                if (match.isPresent()) {
                    targetOption = match.get();
                    targetOption.setOptionText(optionPayload.getOptionText());
                } else {
                    targetOption = new PollOption();
                    targetOption.setOptionText(optionPayload.getOptionText());
                    targetOption.setVoteCount(0);
                }
            } else {
                targetOption = new PollOption();
                targetOption.setOptionText(optionPayload.getOptionText());
                targetOption.setVoteCount(0);
            }
            
            targetOption.setOptionOrder(orderIndex++);
            totalVotesAccum += targetOption.getVoteCount();
            newOptionsList.add(targetOption);
        }

        existing.getOptions().clear();
        existing.getOptions().addAll(newOptionsList);
        existing.setVoteCount(totalVotesAccum);
        existing.setUpdatedAt(LocalDateTime.now());

        Poll saved = pollRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> vote(
            @PathVariable Long id,
            @RequestParam Long optionId
    ) {
        Optional<Poll> opt = pollRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Poll not found"));
        }

        Poll poll = opt.get();
        if (!"active".equalsIgnoreCase(poll.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Poll is closed or inactive"));
        }

        Optional<PollOption> optionOpt = poll.getOptions().stream()
                .filter(o -> o.getId().equals(optionId))
                .findFirst();

        if (optionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid option chosen"));
        }

        PollOption option = optionOpt.get();
        option.setVoteCount((option.getVoteCount() != null ? option.getVoteCount() : 0) + 1);
        poll.setVoteCount((poll.getVoteCount() != null ? poll.getVoteCount() : 0) + 1);
        poll.setUpdatedAt(LocalDateTime.now());

        pollRepository.save(poll);
        return ResponseEntity.ok(poll);
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<?> getResults(@PathVariable Long id) {
        Optional<Poll> opt = pollRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Poll not found"));
        }
        Poll poll = opt.get();
        
        Map<String, Object> results = new HashMap<>();
        results.put("id", poll.getId());
        results.put("question", poll.getQuestion());
        results.put("totalVotes", poll.getVoteCount());
        results.put("options", poll.getOptions());
        return ResponseEntity.ok(results);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<Poll> opt = pollRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Poll not found"));
        }
        Poll existing = opt.get();
        existing.setStatus("deleted"); // Soft delete
        existing.setUpdatedAt(LocalDateTime.now());
        pollRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Poll soft-deleted successfully"));
    }
}
