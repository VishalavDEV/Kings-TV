package com.kingstv.controllers.admin;

import com.kingstv.models.CustomPoll;
import com.kingstv.models.PollOption;
import com.kingstv.repository.CustomPollRepository;
import com.kingstv.repository.PollOptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping({"/api/admin/polls", "/api/v1/admin/polls", "/api/public/polls"})
public class AdminPollController {

    @Autowired
    private CustomPollRepository pollRepository;

    @Autowired
    private PollOptionRepository optionRepository;

    @GetMapping
    public ResponseEntity<?> getAllPolls() {
        List<CustomPoll> polls = pollRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (CustomPoll poll : polls) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", poll.getId());
            map.put("question", poll.getQuestion());
            map.put("language", poll.getLanguage());
            map.put("votePermission", poll.getVotePermission());
            map.put("status", poll.getStatus());
            map.put("createdAt", poll.getCreatedAt());
            map.put("options", optionRepository.findByPollId(poll.getId()));
            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPollById(@PathVariable Long id) {
        Optional<CustomPoll> opt = pollRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        CustomPoll poll = opt.get();
        Map<String, Object> map = new HashMap<>();
        map.put("id", poll.getId());
        map.put("question", poll.getQuestion());
        map.put("language", poll.getLanguage());
        map.put("votePermission", poll.getVotePermission());
        map.put("status", poll.getStatus());
        map.put("createdAt", poll.getCreatedAt());
        map.put("options", optionRepository.findByPollId(poll.getId()));

        return ResponseEntity.ok(map);
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<?> getPollResults(@PathVariable Long id) {
        Optional<CustomPoll> opt = pollRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        CustomPoll poll = opt.get();
        List<PollOption> options = optionRepository.findByPollId(poll.getId());
        int totalVotes = options.stream().mapToInt(o -> o.getVoteCount() != null ? o.getVoteCount() : 0).sum();

        Map<String, Object> res = new HashMap<>();
        res.put("pollId", poll.getId());
        res.put("question", poll.getQuestion());
        res.put("totalVotes", totalVotes);
        res.put("options", options);

        return ResponseEntity.ok(res);
    }

    private static final Set<String> votedIps = Collections.synchronizedSet(new HashSet<>());

    @PostMapping("/{id}/vote")
    @Transactional
    public ResponseEntity<?> voteOnPoll(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Optional<CustomPoll> opt = pollRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        CustomPoll poll = opt.get();
        if ("INACTIVE".equalsIgnoreCase(poll.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "This poll is inactive."));
        }

        Object optionIdObj = body.get("optionId");
        if (optionIdObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "optionId is required"));
        }

        Long optionId = Long.valueOf(optionIdObj.toString());
        Optional<PollOption> optionOpt = optionRepository.findById(optionId);
        if (optionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid option ID"));
        }

        PollOption pollOpt = optionOpt.get();
        pollOpt.setVoteCount((pollOpt.getVoteCount() != null ? pollOpt.getVoteCount() : 0) + 1);
        optionRepository.save(pollOpt);

        List<PollOption> options = optionRepository.findByPollId(poll.getId());
        int totalVotes = options.stream().mapToInt(o -> o.getVoteCount() != null ? o.getVoteCount() : 0).sum();

        return ResponseEntity.ok(Map.of(
            "message", "Vote recorded successfully",
            "pollId", poll.getId(),
            "totalVotes", totalVotes,
            "options", options
        ));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createPoll(@RequestBody Map<String, Object> body) {
        String question = (String) body.get("question");
        if (question == null || question.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question is required"));
        }

        CustomPoll poll = new CustomPoll();
        poll.setQuestion(question);
        poll.setLanguage((String) body.getOrDefault("language", "ta"));
        poll.setVotePermission((String) body.getOrDefault("votePermission", "ALL_USERS"));
        poll.setStatus((String) body.getOrDefault("status", "ACTIVE"));

        CustomPoll savedPoll = pollRepository.save(poll);

        List<String> rawOptions = (List<String>) body.get("options");
        List<PollOption> savedOptions = new ArrayList<>();
        if (rawOptions != null) {
            for (String optText : rawOptions) {
                if (optText != null && !optText.trim().isEmpty()) {
                    PollOption option = new PollOption();
                    option.setPollId(savedPoll.getId());
                    option.setOptionText(optText.trim());
                    option.setVoteCount(0);
                    savedOptions.add(optionRepository.save(option));
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", savedPoll.getId());
        response.put("question", savedPoll.getQuestion());
        response.put("language", savedPoll.getLanguage());
        response.put("votePermission", savedPoll.getVotePermission());
        response.put("status", savedPoll.getStatus());
        response.put("options", savedOptions);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updatePoll(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Optional<CustomPoll> opt = pollRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        CustomPoll poll = opt.get();
        if (body.containsKey("question")) poll.setQuestion((String) body.get("question"));
        if (body.containsKey("language")) poll.setLanguage((String) body.get("language"));
        if (body.containsKey("votePermission")) poll.setVotePermission((String) body.get("votePermission"));
        if (body.containsKey("status")) poll.setStatus((String) body.get("status"));

        CustomPoll saved = pollRepository.save(poll);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deletePoll(@PathVariable Long id) {
        if (!pollRepository.existsById(id)) return ResponseEntity.notFound().build();

        optionRepository.deleteByPollId(id);
        pollRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Poll deleted successfully"));
    }
}
