package com.example.backend.modules.auth.service.interfaces;

import com.example.backend.modules.auth.dto.DangNhapRequest;
import com.example.backend.modules.auth.dto.XacThucResponse;
import jakarta.servlet.http.HttpServletRequest;

import com.example.backend.modules.auth.dto.RefreshTokenRequest;
import com.example.backend.modules.auth.dto.QuenMatKhauRequest;
import com.example.backend.modules.auth.dto.DatLaiMatKhauRequest;

public interface XacThucService {
    XacThucResponse login(DangNhapRequest request, HttpServletRequest httpRequest);
    void logout(String accessToken);
    XacThucResponse refreshToken(String refreshToken, HttpServletRequest httpRequest);
    void guiOtpQuenMatKhau(QuenMatKhauRequest request);
    void xacNhanOtpVaDatLaiMatKhau(DatLaiMatKhauRequest request);
}

