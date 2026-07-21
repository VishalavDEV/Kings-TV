package com.kingstv.controllers.admin;

import com.kingstv.models.LiveChannel;
import com.kingstv.repository.LiveChannelRepository;
import com.kingstv.security.RequiresPermission;
import com.kingstv.models.Permission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/admin/livestream", "/api/v1/admin/livestream"})
@RequiresPermission(Permission.CONFIG_WRITE)
public class AdminLiveStreamController {

    @Autowired
    private LiveChannelRepository liveChannelRepository;

    @GetMapping
    public ResponseEntity<List<LiveChannel>> getAllStreams() {
        return ResponseEntity.ok(liveChannelRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createStream(@RequestBody LiveChannel channel) {
        if (channel.getTitle() == null || channel.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Stream title is required"));
        }
        LiveChannel saved = liveChannelRepository.save(channel);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStream(@PathVariable Long id, @RequestBody LiveChannel updated) {
        Optional<LiveChannel> opt = liveChannelRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        LiveChannel channel = opt.get();
        if (updated.getTitle() != null) channel.setTitle(updated.getTitle());
        if (updated.getStreamUrl() != null) channel.setStreamUrl(updated.getStreamUrl());
        if (updated.getStreamKey() != null) channel.setStreamKey(updated.getStreamKey());
        if (updated.getIsActive() != null) channel.setIsActive(updated.getIsActive());

        LiveChannel saved = liveChannelRepository.save(channel);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStream(@PathVariable Long id) {
        if (!liveChannelRepository.existsById(id)) return ResponseEntity.notFound().build();
        liveChannelRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Live Stream deleted successfully"));
    }
}
