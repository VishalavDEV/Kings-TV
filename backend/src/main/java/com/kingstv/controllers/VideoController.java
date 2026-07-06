package com.kingstv.controllers;

import com.kingstv.models.VideoContent;
import com.kingstv.repository.VideoContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/videos")
public class VideoController {

    @Autowired
    private VideoContentRepository videoContentRepository;

    @GetMapping
    public List<VideoContent> getVideos() {
        return videoContentRepository.findByIsLiveTvOrderByPublishedAtDesc(0);
    }

    @GetMapping("/live")
    public ResponseEntity<?> getLiveTv() {
        List<VideoContent> liveList = videoContentRepository.findByIsLiveTvOrderByPublishedAtDesc(1);
        if (liveList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Live TV not configured"));
        }
        return ResponseEntity.ok(liveList.get(0));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVideoById(@PathVariable Long id) {
        Optional<VideoContent> vidOpt = videoContentRepository.findById(id);
        if (vidOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Video not found"));
        }
        return ResponseEntity.ok(vidOpt.get());
    }

    @PostMapping
    public ResponseEntity<?> createVideo(@RequestBody VideoContent video) {
        if (video.getTitle() == null || video.getYoutubeUrl() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title and YouTube URL are required"));
        }
        VideoContent saved = videoContentRepository.save(video);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVideo(@PathVariable Long id, @RequestBody VideoContent videoDetails) {
        Optional<VideoContent> vidOpt = videoContentRepository.findById(id);
        if (vidOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Video not found"));
        }
        VideoContent video = vidOpt.get();
        video.setCategoryId(videoDetails.getCategoryId());
        video.setTitle(videoDetails.getTitle());
        video.setYoutubeUrl(videoDetails.getYoutubeUrl());
        video.setDescription(videoDetails.getDescription());
        video.setIsLiveTv(videoDetails.getIsLiveTv());
        video.setViewsCount(videoDetails.getViewsCount());
        
        VideoContent updated = videoContentRepository.save(video);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVideo(@PathVariable Long id) {
        Optional<VideoContent> vidOpt = videoContentRepository.findById(id);
        if (vidOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Video not found"));
        }
        videoContentRepository.delete(vidOpt.get());
        return ResponseEntity.noContent().build();
    }
}
