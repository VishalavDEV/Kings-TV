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

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class StorageServiceImpl implements StorageService {

    private static final Logger LOGGER = Logger.getLogger(StorageServiceImpl.class.getName());

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

    @Override
    public String uploadFile(MultipartFile file, String folderType) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file.");
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

        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        } else {
            // Determine extension from content-type if missing
            if (contentType != null) {
                if (contentType.equals("image/png")) extension = ".png";
                else if (contentType.equals("image/jpeg")) extension = ".jpg";
                else if (contentType.equals("image/webp")) extension = ".webp";
                else if (contentType.equals("video/mp4")) extension = ".mp4";
            }
        }
        
        String filename = UUID.randomUUID().toString() + extension;

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

                s3Client.putObject(requestBuilder.build(), 
                        RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

                String url;
                if (awsCdnUrl != null && !awsCdnUrl.trim().isEmpty()) {
                    String cleanCdn = awsCdnUrl.endsWith("/") ? awsCdnUrl : awsCdnUrl + "/";
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
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String localUrl = "/uploads/" + folderType + "/" + year + "/" + month + "/" + filename;
            LOGGER.info("Local save successful. Path URL: " + localUrl);
            return localUrl;
        } catch (IOException e) {
            LOGGER.log(Level.SEVERE, "Failed to save file locally.", e);
            throw new RuntimeException("Failed to upload/save file: " + e.getMessage(), e);
        }
    }
}
