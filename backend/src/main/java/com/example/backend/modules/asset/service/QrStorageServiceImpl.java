package com.example.backend.modules.asset.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.backend.modules.asset.service.interfaces.QrStorageService;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
@Slf4j
public class QrStorageServiceImpl implements QrStorageService {

    private final S3Client s3Client;

    @Value("${app.r2.bucket-name}")
    private String bucketName;

    @Value("${app.r2.public-url}")
    private String publicUrl;

    @Override
    public String uploadQrCode(byte[] imageBytes, String objectKey) {
        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectKey)
                            .contentType("image/png")
                            .build(),
                    RequestBody.fromBytes(imageBytes));

            String normalizedPublicUrl = publicUrl.endsWith("/") ? publicUrl : publicUrl + "/";
            String fullUrl = normalizedPublicUrl + objectKey;
            log.info("Upload ảnh QR thành công lên Cloudflare R2: {}", fullUrl);
            return fullUrl;
        } catch (Exception e) {
            log.error("Lỗi khi upload QR code lên Cloudflare R2 (key = {}): {}", objectKey, e.getMessage(), e);
            throw e;
        }
    }
}
