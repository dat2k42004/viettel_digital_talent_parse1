package com.example.backend.modules.tenant.controller;

import com.example.backend.modules.tenant.dto.DangKyDonViRequest;
import com.example.backend.modules.tenant.dto.XacThucOtpRequest;
import com.example.backend.modules.tenant.service.interfaces.DonViService;
import com.example.backend.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/don-vi")
@RequiredArgsConstructor
public class DonViController {

    private final DonViService donViService;

    @PostMapping("/dang-ky")
    public ApiResponse<String> dangKyDonVi(@Valid @RequestBody DangKyDonViRequest request) {
        donViService.dangKyDonVi(request);
        return ApiResponse.success("?ăng kể thểnh cóng. Vui lỗing kiểm tra email (hoặc console) để lấy mở OTP.");
    }

    @PostMapping("/xac-thuc-otp")
    public ApiResponse<String> xacThucOtp(@Valid @RequestBody XacThucOtpRequest request) {
        donViService.xacThucOtp(request);
        return ApiResponse.success("Kých hoạt đơn vị thểnh cóng. Bạn có thể đăng nhập.");
    }
}

