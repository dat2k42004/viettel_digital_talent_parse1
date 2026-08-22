package com.example.backend.modules.asset.service.interfaces;

public interface QrStorageService {
    String uploadQrCode(byte[] imageBytes, String objectKey);
}
