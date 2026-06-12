package com.example.backend.modules.tenant.controller;

import com.example.backend.modules.tenant.dto.DangKyDonViRequest;
import com.example.backend.modules.tenant.dto.XacThucOtpRequest;
import com.example.backend.modules.tenant.dto.DonViResponse;
import com.example.backend.modules.tenant.dto.DonViUpdateRequest;
import com.example.backend.modules.tenant.dto.DonViTrangThaiRequest;
import com.example.backend.modules.tenant.service.interfaces.DonViService;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/don-vi")
@RequiredArgsConstructor
public class DonViController {

    private final DonViService donViService;

    @PostMapping("/dang-ky")
    public ApiResponse<String> dangKyDonVi(@Valid @RequestBody DangKyDonViRequest request) {
        donViService.dangKyDonVi(request);
        return ApiResponse.success("Đăng ký thành công. Vui lòng kiểm tra email để lấy mở OTP.");
    }

    @PostMapping("/xac-thuc-otp")
    public ApiResponse<String> xacThucOtp(@Valid @RequestBody XacThucOtpRequest request) {
        donViService.xacThucOtp(request);
        return ApiResponse.success("Kích hoạt đơn vị thành công. Bạn có thể đăng nhập.");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_DON_VI')")
    public ApiResponse<DonViResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(donViService.layTheoId(id));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_DON_VI')")
    public ApiResponse<PageResponse<DonViResponse>> layDanhSach(
            @RequestParam(required = false) String ten,
            @RequestParam(required = false) String maDonVi,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String maSoThue,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(donViService.layDanhSach(ten, maDonVi, trangThai, maSoThue, page, size));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_DON_VI')")
    public ApiResponse<DonViResponse> capNhatThongTin(
            @PathVariable Long id,
            @Valid @RequestBody DonViUpdateRequest request) {
        return ApiResponse.success(donViService.capNhatThongTin(id, request));
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasAuthority('KHOA_DON_VI')")
    public ApiResponse<String> capNhatTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody DonViTrangThaiRequest request) {
        donViService.capNhatTrangThai(id, request);
        return ApiResponse.success("Cập nhật trạng thái đơn vị và các thực thể liên quan thành công");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_DON_VI')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        donViService.xoaMem(id);
        return ApiResponse.success("Xóa mềm đơn vị thành công");
    }
}
