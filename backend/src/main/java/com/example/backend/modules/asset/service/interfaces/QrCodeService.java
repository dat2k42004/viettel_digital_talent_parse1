package com.example.backend.modules.asset.service.interfaces;

import com.google.zxing.WriterException;

public interface QrCodeService {
    byte[] generateQrBytes(String content, int width, int height) throws WriterException;
}
