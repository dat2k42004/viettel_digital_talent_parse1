package com.example.backend.modules.auth.service.interfaces;

import com.example.backend.modules.auth.dto.DangNhapRequest;
import com.example.backend.modules.auth.dto.XacThucResponse;
import jakarta.servlet.http.HttpServletRequest;

import com.example.backend.modules.auth.dto.RefreshTokenRequest;
import com.example.backend.modules.auth.dto.QuenMatKhauRequest;
import com.example.backend.modules.auth.dto.DatLaiMatKhauRequest;
import com.example.backend.modules.auth.dto.DoiMatKhauRequest;
import com.example.backend.modules.auth.dto.NguoiDungResponse;

public interface XacThucService {
    XacThucResponse login(DangNhapRequest request, HttpServletRequest httpRequest);
    void logout(String accessToken, String refreshToken);
    XacThucResponse refreshToken(String refreshToken, HttpServletRequest httpRequest);
    void guiOtpQuenMatKhau(QuenMatKhauRequest request);
    void xacNhanOtpVaDatLaiMatKhau(DatLaiMatKhauRequest request);
    void doiMatKhau(Long userId, DoiMatKhauRequest request);
    NguoiDungResponse layHoSoCaNhan(Long userId);
}

