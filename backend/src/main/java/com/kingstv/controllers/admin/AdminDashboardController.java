package com.kingstv.controllers.admin;

import com.kingstv.models.*;
import com.kingstv.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    @Autowired private ArticleRepository articleRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private ContactRequestRepository contactRequestRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        List<Article> articles = articleRepository.findAll();

        long totalPosts = articles.size();
        long pendingPosts = articles.stream().filter(a -> "PENDING".equalsIgnoreCase(a.getStatus())).count();
        long drafts = articles.stream().filter(a -> "DRAFT".equalsIgnoreCase(a.getStatus())).count();
        long scheduledPosts = articles.stream().filter(a -> "SCHEDULED".equalsIgnoreCase(a.getStatus())).count();

        // 1. Recent Pending Comments
        List<Comment> pendingComments = commentRepository.findByStatusOrderByCreatedAtDesc("pending");
        if (pendingComments.size() > 5) {
            pendingComments = pendingComments.subList(0, 5);
        }

        // 2. Recent Contact Messages
        List<ContactRequest> contactMessages = contactRequestRepository.findAll(Sort.by("createdAt").descending());
        if (contactMessages.size() > 5) {
            contactMessages = contactMessages.subList(0, 5);
        }

        // 3. Recent Users
        List<User> recentUsersList = userRepository.findAll(PageRequest.of(0, 5, Sort.by("id").descending())).getContent();
        List<Map<String, Object>> recentUsers = recentUsersList.stream().map(u -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("fullName", u.getFullName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("profileImage", u.getProfileImage());
            map.put("createdAt", u.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalPosts", totalPosts);
        res.put("pendingPosts", pendingPosts);
        res.put("drafts", drafts);
        res.put("scheduledPosts", scheduledPosts);
        res.put("recentPendingComments", pendingComments);
        res.put("recentContactMessages", contactMessages);
        res.put("recentUsers", recentUsers);

        return ResponseEntity.ok(res);
    }

    @GetMapping("/recent-comments")
    public ResponseEntity<List<Comment>> getRecentComments() {
        List<Comment> recentComments = commentRepository.findByStatusOrderByCreatedAtDesc("pending");
        if (recentComments.size() > 5) {
            recentComments = recentComments.subList(0, 5);
        }
        return ResponseEntity.ok(recentComments);
    }

    @GetMapping("/recent-contact-messages")
    public ResponseEntity<List<ContactRequest>> getRecentContactMessages() {
        List<ContactRequest> recentMessages = contactRequestRepository.findAll(Sort.by("createdAt").descending());
        if (recentMessages.size() > 5) {
            recentMessages = recentMessages.subList(0, 5);
        }
        return ResponseEntity.ok(recentMessages);
    }

    @GetMapping("/recent-users")
    public ResponseEntity<?> getRecentUsers() {
        List<User> recentUsersList = userRepository.findAll(PageRequest.of(0, 5, Sort.by("id").descending())).getContent();
        return ResponseEntity.ok(recentUsersList);
    }
}
