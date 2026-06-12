package com.example.backend.modules.file.service;

import com.example.backend.modules.file.service.interfaces.FileService;
import com.example.backend.shared.exception.NghiepVuException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.InputStream;
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
    public InputStream downloadFile(String key) {
        validateKey(key);
        try {
            ResponseInputStream<GetObjectResponse> s3is = s3Client.getObject(
                    GetObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .build()
            );
            return s3is;
        } catch (Exception e) {
            log.error("Lỗi khi tải file từ Cloudflare R2 (key = {}): {}", key, e.getMessage(), e);
            throw new NghiepVuException("Không tìm thấy hoặc không thể tải xuống file yêu cầu", 404);
        }
    }

    @Override
    public String getOriginalFilename(String key) {
        validateKey(key);
        if (key.contains("/")) {
            key = key.substring(key.lastIndexOf("/") + 1);
        }
        if (key.length() > 37 && key.substring(36, 37).equals("_")) {
            return key.substring(37);
        }
        return key;
    }

    @Override
    public long getFileLength(String key) {
        validateKey(key);
        try {
            HeadObjectResponse response = s3Client.headObject(
                    HeadObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .build()
            );
            return response.contentLength();
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin Head Object của file key = {}: {}", key, e.getMessage());
            throw new NghiepVuException("Không tìm thấy file yêu cầu trên hệ thống lưu trữ", 404);
        }
    }

    @Override
    public String getContentType(String key) {
        validateKey(key);
        try {
            HeadObjectResponse response = s3Client.headObject(
                    HeadObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .build()
            );
            return response.contentType();
        } catch (Exception e) {
            log.error("Lỗi khi lấy Content-Type của file key = {}: {}", key, e.getMessage());
            return "application/octet-stream";
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
