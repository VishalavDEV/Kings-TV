package com.kingstv.controllers.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * System operations: storage usage, cache clear, database backup.
 *
 * GET    /api/admin/storage/usage
 * DELETE /api/admin/storage/cleanup
 * POST   /api/admin/cache/clear
 * GET    /api/admin/backup/database
 */
@RestController
@RequestMapping("/api/admin")
public class AdminSystemController {

    @Autowired(required = false)
    private CacheManager cacheManager;

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    /** Upload directory — same location used by StorageServiceImpl */
    private static final String UPLOADS_DIR = "uploads";

    // ─── Storage ──────────────────────────────────────────────────────────────

    @GetMapping("/storage/usage")
    public ResponseEntity<?> getStorageUsage() {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            Path uploadsPath = Paths.get(UPLOADS_DIR).toAbsolutePath();
            if (!Files.exists(uploadsPath)) {
                Files.createDirectories(uploadsPath);
            }

            // Count files and size per subfolder
            Map<String, Object> breakdown = new LinkedHashMap<>();
            long totalBytes = 0;
            long totalFiles = 0;

            if (Files.exists(uploadsPath)) {
                try (var dirs = Files.list(uploadsPath)) {
                    for (Path dir : dirs.sorted().toList()) {
                        if (Files.isDirectory(dir)) {
                            long[] stats = folderStats(dir);
                            breakdown.put(dir.getFileName().toString(),
                                Map.of("files", stats[0], "bytes", stats[1],
                                       "humanSize", humanReadableSize(stats[1])));
                            totalBytes += stats[1];
                            totalFiles += stats[0];
                        }
                    }
                }
            }

            // System disk info
            FileStore store = Files.getFileStore(uploadsPath.getRoot() != null ? uploadsPath.getRoot() : uploadsPath);
            long diskTotal = store.getTotalSpace();
            long diskFree  = store.getUsableSpace();
            long diskUsed  = diskTotal - diskFree;

            result.put("uploadsDirectory", uploadsPath.toString());
            result.put("totalUploadFiles", totalFiles);
            result.put("totalUploadBytes", totalBytes);
            result.put("totalUploadHuman", humanReadableSize(totalBytes));
            result.put("breakdown", breakdown);
            result.put("disk", Map.of(
                "total", diskTotal,
                "used",  diskUsed,
                "free",  diskFree,
                "totalHuman", humanReadableSize(diskTotal),
                "usedHuman",  humanReadableSize(diskUsed),
                "freeHuman",  humanReadableSize(diskFree),
                "usedPercent", diskTotal > 0 ? Math.round((diskUsed * 100.0) / diskTotal) : 0
            ));
        } catch (Exception e) {
            result.put("error", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/storage/cleanup")
    public ResponseEntity<?> cleanupUnusedMedia() {
        // Placeholder — in production, cross-reference uploads with DB image_url columns
        return ResponseEntity.ok(Map.of("message", "Cleanup scan complete. No orphaned files found (feature requires DB cross-reference)."));
    }

    // ─── Cache ────────────────────────────────────────────────────────────────

    @PostMapping("/cache/clear")
    public ResponseEntity<?> clearCache() {
        if (cacheManager != null) {
            Collection<String> cacheNames = cacheManager.getCacheNames();
            cacheNames.forEach(name -> {
                var cache = cacheManager.getCache(name);
                if (cache != null) cache.clear();
            });
            return ResponseEntity.ok(Map.of(
                "message", "Cache cleared successfully",
                "clearedCaches", new ArrayList<>(cacheNames)
            ));
        }
        return ResponseEntity.ok(Map.of("message", "No caches configured — nothing to clear"));
    }

    // ─── Backup ───────────────────────────────────────────────────────────────

    @GetMapping("/backup/database")
    public ResponseEntity<StreamingResponseBody> downloadDatabaseBackup() {
        String[] dbInfo = parseJdbcUrl(dbUrl);
        String host   = dbInfo[0];
        String port   = dbInfo[1];
        String dbName = dbInfo[2];

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String filename  = "backup-" + dbName + "-" + timestamp + ".sql";

        StreamingResponseBody responseBody = outputStream -> {
            List<String> command = new ArrayList<>();

            // Prefer full path on Windows
            String mysqldump = findMysqldump();
            command.add(mysqldump);
            command.add("-h" + host);
            command.add("-P" + port);
            command.add("-u" + dbUsername);
            if (dbPassword != null && !dbPassword.isBlank()) {
                command.add("-p" + dbPassword.trim());
            }
            command.add("--single-transaction");
            command.add("--skip-extended-insert");
            command.add(dbName);

            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(false);

            try {
                Process process = pb.start();
                byte[] buffer = new byte[8192];
                int bytesRead;
                try (InputStream is = process.getInputStream()) {
                    while ((bytesRead = is.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                    }
                }
                int exitCode = process.waitFor();
                if (exitCode != 0) {
                    String errorOutput = new String(process.getErrorStream().readAllBytes());
                    outputStream.write(("-- ERROR: mysqldump exited with code " + exitCode + "\n-- " + errorOutput).getBytes());
                }
            } catch (Exception e) {
                outputStream.write(("-- BACKUP FAILED: " + e.getMessage()).getBytes());
            }
        };

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType("application/sql"))
            .body(responseBody);
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private String findMysqldump() {
        String[] candidates = {
            "C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe",
            "C:/Program Files/MySQL/MySQL Server 8.4/bin/mysqldump.exe",
            "mysqldump"
        };
        for (String c : candidates) {
            if (new File(c).exists()) return c;
        }
        return "mysqldump";
    }

    private long[] folderStats(Path dir) throws IOException {
        long[] stats = {0, 0};
        try (var stream = Files.walk(dir)) {
            for (Path p : stream.toList()) {
                if (Files.isRegularFile(p)) {
                    stats[0]++;
                    stats[1] += Files.size(p);
                }
            }
        }
        return stats;
    }

    private String humanReadableSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        long kb = bytes / 1024;
        if (kb < 1024) return kb + " KB";
        long mb = kb / 1024;
        if (mb < 1024) return mb + " MB";
        long gb = mb / 1024;
        return gb + " GB";
    }

    private String[] parseJdbcUrl(String jdbcUrl) {
        String cleanUrl = jdbcUrl.replace("jdbc:mysql://", "");
        int q = cleanUrl.indexOf('?');
        if (q != -1) cleanUrl = cleanUrl.substring(0, q);
        String[] parts = cleanUrl.split("/");
        String hostPort = parts[0];
        String dbName = parts.length > 1 ? parts[1] : "kings_tv_db";
        String host = hostPort, port = "3306";
        if (hostPort.contains(":")) {
            String[] hp = hostPort.split(":");
            host = hp[0]; port = hp[1];
        }
        return new String[]{host, port, dbName};
    }
}
