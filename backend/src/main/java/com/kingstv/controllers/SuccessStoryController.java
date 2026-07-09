package com.kingstv.controllers;

import com.kingstv.models.SuccessStory;
import com.kingstv.repository.SuccessStoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/stories")
public class SuccessStoryController {

    @Autowired
    private SuccessStoryRepository successStoryRepository;

    @GetMapping
    public List<SuccessStory> getStories() {
        return successStoryRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStoryById(@PathVariable Long id) {
        Optional<SuccessStory> storyOpt = successStoryRepository.findById(id);
        if (storyOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Story not found"));
        }
        return ResponseEntity.ok(storyOpt.get());
    }

    @PostMapping
    public ResponseEntity<?> createStory(@RequestBody SuccessStory story) {
        if (story.getAuthorName() == null || story.getBusinessName() == null || story.getTitle() == null || story.getDetails() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Required fields are missing"));
        }
        SuccessStory saved = successStoryRepository.save(story);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStory(@PathVariable Long id, @RequestBody SuccessStory storyDetails) {
        Optional<SuccessStory> storyOpt = successStoryRepository.findById(id);
        if (storyOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Story not found"));
        }
        SuccessStory story = storyOpt.get();
        story.setAuthorName(storyDetails.getAuthorName());
        story.setBusinessName(storyDetails.getBusinessName());
        story.setTitle(storyDetails.getTitle());
        story.setDetails(storyDetails.getDetails());
        story.setIsCaseStudy(storyDetails.getIsCaseStudy());
        story.setPdfUrl(storyDetails.getPdfUrl());
        
        SuccessStory updated = successStoryRepository.save(story);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStory(@PathVariable Long id) {
        Optional<SuccessStory> storyOpt = successStoryRepository.findById(id);
        if (storyOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Story not found"));
        }
        successStoryRepository.delete(storyOpt.get());
        return ResponseEntity.noContent().build();
    }
}
