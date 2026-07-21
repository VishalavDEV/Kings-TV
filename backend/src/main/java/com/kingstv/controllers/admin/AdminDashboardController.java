package com.kingstv.controllers.admin;

import com.kingstv.models.Comment;
import com.kingstv.models.ContactRequest;
import com.kingstv.models.User;
import com.kingstv.repository.ArticleRepository;
import com.kingstv.repository.CommentRepository;
import com.kingstv.repository.ContactRequestRepository;
import com.kingstv.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ContactRequestRepository contactRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        long totalPosts = articleRepository.count();
        long pendingPosts = articleRepository.countByStatus("pending");
        long drafts = articleRepository.countByStatus("draft");
        long scheduledPosts = articleRepository.countByStatus("scheduled");

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPosts", totalPosts);
        stats.put("pendingPosts", pendingPosts);
        stats.put("drafts", drafts);
        stats.put("scheduledPosts", scheduledPosts);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent-comments")
    public ResponseEntity<List<Comment>> getRecentComments() {
        List<Comment> recentComments = commentRepository.findTop5ByStatusOrderByCreatedAtDesc("pending");
        if (recentComments.isEmpty()) {
            recentComments = commentRepository.findTop5ByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(recentComments);
    }

    @GetMapping("/recent-contact-messages")
    public ResponseEntity<List<ContactRequest>> getRecentContactMessages() {
        List<ContactRequest> recentMessages = contactRequestRepository.findTop5ByOrderByCreatedAtDesc();
        return ResponseEntity.ok(recentMessages);
    }

    @GetMapping("/recent-users")
    public ResponseEntity<List<User>> getRecentUsers() {
        List<User> recentUsers = userRepository.findTop5ByOrderByCreatedAtDesc();
        return ResponseEntity.ok(recentUsers);
    }
}
