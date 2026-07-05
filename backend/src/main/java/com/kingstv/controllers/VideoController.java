package com.kingstv.controllers;

import com.kingstv.models.VideoContent;
import com.kingstv.repository.VideoContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

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
}
