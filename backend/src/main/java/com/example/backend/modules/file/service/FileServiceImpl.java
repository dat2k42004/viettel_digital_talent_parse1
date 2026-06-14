package com.example.backend.modules.file.service;

import com.example.backend.modules.file.service.interfaces.FileService;
import com.example.backend.shared.exception.NghiepVuException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileServiceImpl implements FileService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${app.r2.bucket-name}")
    private String bucketName;

    @Value("${app.r2.public-url}")
    private String publicUrl;

    @Override
    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new NghiepVuException("File không được trống", 400);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            originalFilename = originalFilename.substring(0, originalFilename.lastIndexOf("."));
        }

        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String cleanName = originalFilename != null ? originalFilename.replaceAll("[^a-zA-Z0-9-_]", "_") : "file";
        String uuid = UUID.randomUUID().toString();
        String key = "shared/" + datePath + "/" + uuid + "_" + cleanName + extension;

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );

            log.info("Đã upload file lên Cloudflare R2 thành công. Key: {}", key);

            String normalizedPublicUrl = publicUrl.endsWith("/") ? publicUrl : publicUrl + "/";
            return normalizedPublicUrl + key;

        } catch (Exception e) {
            log.error("Lỗi khi tải file lên Cloudflare R2: {}", e.getMessage(), e);
            throw new NghiepVuException("Tải file lên hệ thống lưu trữ thất bại: " + e.getMessage(), 500);
        }
    }

    @Override
    public List<String> uploadFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new NghiepVuException("Danh sách file tải lên không được trống", 400);
        }

        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            urls.add(uploadFile(file));
        }
        return urls;
    }

    @Override
    public String generatePresignedDownloadUrl(String key) {
        validateKey(key);
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            GetObjectPresignRequest getObjectPresignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(5)) // Link có thời hạn 5 phút
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedGetObjectRequest = s3Presigner.presignGetObject(getObjectPresignRequest);
            return presignedGetObjectRequest.url().toString();
        } catch (Exception e) {
            log.error("Lỗi khi sinh pre-signed URL cho key = {}: {}", key, e.getMessage(), e);
            throw new NghiepVuException("Không thể tạo liên kết tải file: " + e.getMessage(), 500);
        }
    }

    private void validateKey(String key) {
        if (key == null || key.trim().isEmpty()) {
            throw new NghiepVuException("Đường dẫn file (key) không được để trống", 400);
        }
        if (!key.startsWith("shared/")) {
            throw new NghiepVuException("Bạn không có quyền truy cập hoặc tải xuống tài liệu từ thư mục này", 403);
        }
    }
}
