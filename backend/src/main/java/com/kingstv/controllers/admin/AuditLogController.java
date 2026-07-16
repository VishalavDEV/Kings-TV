package com.kingstv.controllers.admin;

import com.kingstv.models.AuditLog;
import com.kingstv.models.Permission;
import com.kingstv.repository.AuditLogRepository;
import com.kingstv.security.RequiresPermission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Audit Log viewer (#6). Read-only, filterable by role/date/action type.
 * No update or delete endpoints exist for audit logs — this is by design.
 */
@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@RequiresPermission(Permission.AUDIT_VIEW)
public class AuditLogController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<?> listAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long actorId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<AuditLog> logs;

        if (role != null && !role.isEmpty()) {
            logs = auditLogRepository.findByActorRole(role, pageRequest);
        } else if (actionType != null && !actionType.isEmpty()) {
            logs = auditLogRepository.findByActionType(actionType, pageRequest);
        } else if (entityType != null && !entityType.isEmpty()) {
            logs = auditLogRepository.findByEntityType(entityType, pageRequest);
        } else if (actorId != null) {
            logs = auditLogRepository.findByActorId(actorId, pageRequest);
        } else if (startDate != null && endDate != null) {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            logs = auditLogRepository.findByTimestampBetween(start, end, pageRequest);
        } else {
            logs = auditLogRepository.findAll(pageRequest);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("logs", logs.getContent());
        response.put("totalElements", logs.getTotalElements());
        response.put("totalPages", logs.getTotalPages());
        response.put("currentPage", page);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAuditLog(@PathVariable Long id) {
        return auditLogRepository.findById(id)
                .map(log -> ResponseEntity.ok((Object) log))
                .orElse(ResponseEntity.notFound().build());
    }

    // Note: No PUT, PATCH, or DELETE endpoints exist here intentionally.
    // The audit log is append-only by design.
}
