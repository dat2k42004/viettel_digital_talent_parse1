package com.example.backend.modules.auth.controller;

import com.example.backend.modules.auth.dto.XacThucResponse;
import com.example.backend.modules.auth.dto.DangNhapRequest;
import com.example.backend.modules.auth.dto.RefreshTokenRequest;
import com.example.backend.modules.auth.dto.QuenMatKhauRequest;
import com.example.backend.modules.auth.dto.DatLaiMatKhauRequest;
import com.example.backend.modules.auth.dto.DoiMatKhauRequest;
import com.example.backend.modules.auth.dto.NguoiDungResponse;
import com.example.backend.modules.auth.dto.LogoutRequest;
import com.example.backend.modules.auth.service.interfaces.XacThucService;
import com.example.backend.modules.auth.security.NguoiDungUserDetails;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.exception.NghiepVuException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    public ApiResponse<String> logout(
            HttpServletRequest httpRequest, 
            @Valid @RequestBody LogoutRequest request) {
        String authHeader = httpRequest.getHeader("Authorization");
        authService.logout(authHeader, request.getRefreshToken());
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

    @PostMapping("/doi-mat-khau")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<String> doiMatKhau(@Valid @RequestBody DoiMatKhauRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof NguoiDungUserDetails userDetails) {
            Long userId = userDetails.getNguoiDung().getId();
            authService.doiMatKhau(userId, request);
            return ApiResponse.success("Đổi mật khẩu thành công");
        }
        throw new NghiepVuException("Chưa đăng nhập", 401);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<NguoiDungResponse> getMyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof NguoiDungUserDetails userDetails) {
            Long userId = userDetails.getNguoiDung().getId();
            NguoiDungResponse profile = authService.layHoSoCaNhan(userId);
            return ApiResponse.success(profile);
        }
        throw new NghiepVuException("Chưa đăng nhập", 401);
    }
}
