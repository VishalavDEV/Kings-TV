package com.kingstv.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import com.kingstv.models.SystemConfig;
import com.kingstv.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import com.kingstv.repository.UserRepository;
import java.time.LocalDate;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class StorageServiceImpl implements StorageService {

    private static final Logger LOGGER = Logger.getLogger(StorageServiceImpl.class.getName());

    @Autowired
    private VideoTranscoderService transcoderService;

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    @Autowired
    private ImageCompressorService imageCompressorService;

    @Autowired
    private UserRepository userRepository;

    @Value("${aws.s3.enabled:false}")
    private boolean s3Enabled;

    @Value("${aws.s3.endpoint:}")
    private String awsEndpoint;

    @Value("${aws.s3.region:us-east-1}")
    private String awsRegion;

    @Value("${aws.s3.access-key:}")
    private String awsAccessKey;

    @Value("${aws.s3.secret-key:}")
    private String awsSecretKey;

    @Value("${aws.s3.bucket:}")
    private String awsBucket;

    @Value("${aws.s3.cdn-url:}")
    private String awsCdnUrl;

    @Value("${aws.s3.use-acl:true}")
    private boolean awsS3UseAcl;

    private S3Client s3Client;

    @PostConstruct
    public void init() {
        if (s3Enabled) {
            try {
                LOGGER.info("Initializing S3 Client with region: " + awsRegion + ", endpoint: " + awsEndpoint);
                S3ClientBuilder builder = S3Client.builder()
                        .credentialsProvider(StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(awsAccessKey, awsSecretKey)
                        ));

                if (awsRegion != null && !awsRegion.trim().isEmpty()) {
                    builder.region(Region.of(awsRegion));
                } else {
                    builder.region(Region.US_EAST_1);
                }

                if (awsEndpoint != null && !awsEndpoint.trim().isEmpty()) {
                    builder.endpointOverride(URI.create(awsEndpoint));
                }

                this.s3Client = builder.build();
                LOGGER.info("S3 Client initialized successfully.");
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "Failed to initialize S3 Client, falling back to local storage.", e);
                this.s3Enabled = false;
            }
        } else {
            LOGGER.info("S3 integration is disabled. Local storage will be used.");
        }
    }

    private String getDynamicCdnUrl() {
        return systemConfigRepository.findByConfigKey(SystemConfig.CDN_BASE_URL)
                .map(SystemConfig::getConfigValue)
                .map(String::trim)
                .filter(val -> !val.isEmpty())
                .orElse(awsCdnUrl);
    }

    private String uploadLocalFileToS3(File file, String s3Key, String contentType) {
        try {
            PutObjectRequest.Builder requestBuilder = PutObjectRequest.builder()
                    .bucket(awsBucket)
                    .key(s3Key)
                    .contentType(contentType);
            if (awsS3UseAcl) {
                requestBuilder.acl(ObjectCannedACL.PUBLIC_READ);
            }
            s3Client.putObject(requestBuilder.build(), RequestBody.fromFile(file));
            
            String cdnUrl = getDynamicCdnUrl();
            if (cdnUrl != null && !cdnUrl.isEmpty()) {
                String cleanCdn = cdnUrl.endsWith("/") ? cdnUrl : cdnUrl + "/";
                return cleanCdn + s3Key;
            } else {
                if (awsEndpoint != null && !awsEndpoint.trim().isEmpty() && !awsEndpoint.contains("amazonaws.com")) {
                    return awsEndpoint + "/" + awsBucket + "/" + s3Key;
                } else {
                    return "https://" + awsBucket + ".s3." + awsRegion + ".amazonaws.com/" + s3Key;
                }
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Failed to upload local file to S3: " + file.getAbsolutePath(), e);
            throw new RuntimeException("S3 direct upload failed", e);
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String folderType) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file.");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.contains(".")) {
            throw new IllegalArgumentException("File name is invalid or has no extension.");
        }

        String extension = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();

        boolean isImage = extension.equals(".jpg") || extension.equals(".jpeg") || extension.equals(".png") || extension.equals(".gif") || extension.equals(".svg") || extension.equals(".webp");
        boolean isDoc = extension.equals(".pdf") || extension.equals(".docx") || extension.equals(".zip");
        boolean isMedia = extension.equals(".mp3") || extension.equals(".mp4") || extension.equals(".wav") || extension.equals(".m4a");

        if (!isImage && !isDoc && !isMedia) {
            throw new IllegalArgumentException("Unsupported file type: " + extension);
        }

        long maxLimit = isImage ? 5 * 1024 * 1024 : (isDoc ? 25 * 1024 * 1024 : 100 * 1024 * 1024);
        if (file.getSize() > maxLimit) {
            throw new IllegalArgumentException("File size exceeds limit of " + (maxLimit / (1024 * 1024)) + "MB.");
        }

        try {
            byte[] fileBytes = file.getBytes();
            if (isImage || isDoc) {
                byte[] header = new byte[Math.min(fileBytes.length, 30)];
                System.arraycopy(fileBytes, 0, header, 0, header.length);
                if (!isValidMagicBytes(header, extension)) {
                    throw new IllegalArgumentException("File content signature mismatch. The file structure is not valid for type " + extension);
                }
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Error reading file stream bytes for safety check.");
        }

        LocalDate now = LocalDate.now();
        String year = String.valueOf(now.getYear());
        String month = String.format("%02d", now.getMonthValue());

        // Organize uploads folder in bucket by type
        String bucketFolder = "documents";
        String contentType = file.getContentType();
        if (folderType != null && folderType.equalsIgnoreCase("webstories")) {
            bucketFolder = "webstories";
        } else if (contentType != null) {
            if (contentType.startsWith("image/")) {
                bucketFolder = "images";
            } else if (contentType.startsWith("video/")) {
                bucketFolder = "videos";
            } else if (contentType.startsWith("audio/")) {
                bucketFolder = "audio";
            }
        }

        // Video HLS Transcoding Pipeline
        if (contentType != null && contentType.startsWith("video/")) {
            String uuid = UUID.randomUUID().toString();
            try {
                // Save temp file
                Path tempDir = Paths.get("uploads", "temp");
                Files.createDirectories(tempDir);
                Path tempFilePath = tempDir.resolve(uuid + extension);
                File tempFile = tempFilePath.toFile();
                Files.copy(file.getInputStream(), tempFilePath, StandardCopyOption.REPLACE_EXISTING);

                // Verify duration cap limit on video files
                double duration = transcoderService.getVideoDuration(tempFile);
                if (duration > 0) {
                    org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && auth.getDetails() instanceof Long) {
                        Long currentUserId = (Long) auth.getDetails();
                        com.kingstv.models.User uInfo = userRepository.findById(currentUserId).orElse(null);
                        if (uInfo != null) {
                            String role = uInfo.getRole();
                            double limit = 300.0; // standard 5 min cap
                            if ("MOBILE_JOURNALIST".equalsIgnoreCase(role)) {
                                limit = 600.0; // 10 min cap
                            } else if ("INSTITUTION_LOGIN".equalsIgnoreCase(role)) {
                                limit = 900.0; // 15 min cap
                            } else if ("SUPER_ADMIN".equalsIgnoreCase(role) || "CHIEF_EDITOR".equalsIgnoreCase(role)) {
                                limit = 3600.0; // 1 hour cap
                            }
                            if (duration > limit) {
                                Files.deleteIfExists(tempFilePath);
                                throw new IllegalArgumentException("Video length " + Math.round(duration) + "s exceeds your role's duration cap (" + Math.round(limit) + "s).");
                            }
                        }
                    }
                }

                // Attempt transcode
                File transcodedDir = transcoderService.transcodeToHls(tempFile, uuid);
                if (transcodedDir != null) {
                    // Success! Delete the temp raw video file
                    Files.deleteIfExists(tempFilePath);
                    
                    File playlistFile = new File(transcodedDir, "index.m3u8");
                    File[] segments = transcodedDir.listFiles((dir, name) -> name.endsWith(".ts"));

                    if (s3Enabled && s3Client != null) {
                        // Upload all segments and playlist to S3
                        String s3Folder = "videos/hls/" + year + "/" + month + "/" + uuid + "/";
                        
                        if (segments != null) {
                            for (File seg : segments) {
                                uploadLocalFileToS3(seg, s3Folder + seg.getName(), "video/MP2T");
                                Files.deleteIfExists(seg.toPath());
                            }
                        }
                        String playlistUrl = uploadLocalFileToS3(playlistFile, s3Folder + "index.m3u8", "application/x-mpegURL");
                        Files.deleteIfExists(playlistFile.toPath());
                        Files.deleteIfExists(transcodedDir.toPath());
                        
                        return playlistUrl;
                    } else {
                        // Local path
                        String localUrl = "/uploads/hls/" + uuid + "/index.m3u8";
                        return localUrl;
                    }
                } else {
                    // Cleanup temp file on transcode failure
                    Files.deleteIfExists(tempFilePath);
                }
            } catch (Exception e) {
                LOGGER.log(Level.WARNING, "HLS transcoding pipeline encountered an issue. Falling back to raw file save.", e);
            }
        }

        // Image Processing & WebP Compression Pipeline
        boolean isProcessedImage = false;
        File compressedImageFile = null;
        if (contentType != null && contentType.startsWith("image/")) {
            String uuid = UUID.randomUUID().toString();
            try {
                Path tempDir = Paths.get("uploads", "temp");
                Files.createDirectories(tempDir);
                File tempTarget = tempDir.resolve(uuid + ".webp").toFile();
                
                File processed = imageCompressorService.compressAndResizeToWebp(file.getInputStream(), tempTarget);
                if (processed != null) {
                    compressedImageFile = processed;
                    contentType = "image/webp";
                    isProcessedImage = true;
                    extension = ".webp";
                }
            } catch (Exception e) {
                LOGGER.log(Level.WARNING, "Image WebP compression pipeline failed. Falling back to original image raw copy.", e);
            }
        }

        String filename = UUID.randomUUID().toString() + extension;

        try {
            if (s3Enabled && s3Client != null) {
                String s3Key = bucketFolder + "/" + year + "/" + month + "/" + filename;
                try {
                    LOGGER.info("Uploading file to S3 bucket '" + awsBucket + "' with key '" + s3Key + "'");
                    
                    PutObjectRequest.Builder requestBuilder = PutObjectRequest.builder()
                            .bucket(awsBucket)
                            .key(s3Key)
                            .contentType(contentType);

                    if (awsS3UseAcl) {
                        requestBuilder.acl(ObjectCannedACL.PUBLIC_READ);
                    }

                    if (isProcessedImage && compressedImageFile != null) {
                        s3Client.putObject(requestBuilder.build(), RequestBody.fromFile(compressedImageFile));
                    } else {
                        s3Client.putObject(requestBuilder.build(), 
                                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
                    }

                    String url;
                    String cdnUrl = getDynamicCdnUrl();
                    if (cdnUrl != null && !cdnUrl.isEmpty()) {
                        String cleanCdn = cdnUrl.endsWith("/") ? cdnUrl : cdnUrl + "/";
                        url = cleanCdn + s3Key;
                    } else {
                        if (awsEndpoint != null && !awsEndpoint.trim().isEmpty() && !awsEndpoint.contains("amazonaws.com")) {
                            // S3 compatible endpoint (like MinIO, R2, Spaces)
                            url = awsEndpoint + "/" + awsBucket + "/" + s3Key;
                        } else {
                            // Standard AWS S3 URL
                            url = "https://" + awsBucket + ".s3." + awsRegion + ".amazonaws.com/" + s3Key;
                        }
                    }
                    LOGGER.info("S3 upload successful. Public URL: " + url);
                    return url;
                } catch (Exception e) {
                    LOGGER.log(Level.SEVERE, "S3 upload failed, falling back to local filesystem storage.", e);
                }
            }

            // Local Storage Fallback
            try {
                LOGGER.info("Saving file locally under folder: " + folderType);
                Path uploadPath = Paths.get("uploads", folderType, year, month);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Path filePath = uploadPath.resolve(filename);
                if (isProcessedImage && compressedImageFile != null) {
                    Files.copy(compressedImageFile.toPath(), filePath, StandardCopyOption.REPLACE_EXISTING);
                } else {
                    Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                }

                String localUrl = "/uploads/" + folderType + "/" + year + "/" + month + "/" + filename;
                LOGGER.info("Local save successful. Path URL: " + localUrl);
                return localUrl;
            } catch (IOException e) {
                LOGGER.log(Level.SEVERE, "Failed to save file locally.", e);
                throw new RuntimeException("Failed to upload/save file: " + e.getMessage(), e);
            }
        } finally {
            if (isProcessedImage && compressedImageFile != null) {
                try {
                    Files.deleteIfExists(compressedImageFile.toPath());
                } catch (IOException e) {
                    LOGGER.warning("Could not delete temporary compressed image file: " + e.getMessage());
                }
            }
        }
    }

    private boolean isValidMagicBytes(byte[] header, String extension) {
        if (header == null || header.length < 4) return false;
        
        String ext = extension.toLowerCase();
        
        if (ext.equals(".jpg") || ext.equals(".jpeg")) {
            return (header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF;
        }
        
        if (ext.equals(".png")) {
            return (header[0] & 0xFF) == 0x89 && (header[1] & 0xFF) == 0x50 && (header[2] & 0xFF) == 0x4E && (header[3] & 0xFF) == 0x47;
        }
        
        if (ext.equals(".gif")) {
            return (header[0] & 0xFF) == 0x47 && (header[1] & 0xFF) == 0x49 && (header[2] & 0xFF) == 0x46 && (header[3] & 0xFF) == 0x38;
        }
        
        if (ext.equals(".webp")) {
            return (header[0] & 0xFF) == 0x52 && (header[1] & 0xFF) == 0x49 && (header[2] & 0xFF) == 0x46 && (header[3] & 0xFF) == 0x46;
        }
        
        if (ext.equals(".svg")) {
            String content = new String(header).toLowerCase();
            return content.contains("<svg") || content.contains("<?xml") || content.contains("<!doctype svg");
        }
        
        if (ext.equals(".pdf")) {
            return (header[0] & 0xFF) == 0x25 && (header[1] & 0xFF) == 0x50 && (header[2] & 0xFF) == 0x44 && (header[3] & 0xFF) == 0x46;
        }
        
        if (ext.equals(".zip") || ext.equals(".docx")) {
            return (header[0] & 0xFF) == 0x50 && (header[1] & 0xFF) == 0x4B && (header[2] & 0xFF) == 0x03 && (header[3] & 0xFF) == 0x04;
        }
        
        return false;
    }
}
