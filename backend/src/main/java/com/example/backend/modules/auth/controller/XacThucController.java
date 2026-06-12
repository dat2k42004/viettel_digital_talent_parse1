package com.example.backend.modules.auth.controller;

import com.example.backend.modules.auth.dto.XacThucResponse;
import com.example.backend.modules.auth.dto.DangNhapRequest;
import com.example.backend.modules.auth.dto.RefreshTokenRequest;
import com.example.backend.modules.auth.dto.QuenMatKhauRequest;
import com.example.backend.modules.auth.dto.DatLaiMatKhauRequest;
import com.example.backend.modules.auth.service.interfaces.XacThucService;
import com.example.backend.shared.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class XacThucController {

    private final XacThucService authService;

    @PostMapping("/login")
    public ApiResponse<XacThucResponse> login(@Valid @RequestBody DangNhapRequest request, HttpServletRequest httpRequest) {
        XacThucResponse response = authService.login(request, httpRequest);
        return ApiResponse.success(response);
    }

    @PostMapping("/logout")
    public ApiResponse<String> logout(HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        authService.logout(authHeader);
        return ApiResponse.success("Đăng xuất thành công");
    }

    @PostMapping("/refresh-token")
    public ApiResponse<XacThucResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request, HttpServletRequest httpRequest) {
        XacThucResponse response = authService.refreshToken(request.getRefreshToken(), httpRequest);
        return ApiResponse.success(response);
    }

    @PostMapping("/quen-mat-khau")
    public ApiResponse<String> quenMatKhau(@Valid @RequestBody QuenMatKhauRequest request) {
        authService.guiOtpQuenMatKhau(request);
        return ApiResponse.success("Mã OTP đặt lại mật khẩu đã được gửi về email của bạn");
    }

    @PostMapping("/dat-lai-mat-khau")
    public ApiResponse<String> datLaiMatKhau(@Valid @RequestBody DatLaiMatKhauRequest request) {
        authService.xacNhanOtpVaDatLaiMatKhau(request);
        return ApiResponse.success("Đặt lại mật khẩu thành công");
    }
}
