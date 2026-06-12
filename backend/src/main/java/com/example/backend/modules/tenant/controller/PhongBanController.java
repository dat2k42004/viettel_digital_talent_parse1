package com.example.backend.modules.tenant.controller;

import com.example.backend.modules.tenant.dto.PhongBanRequest;
import com.example.backend.modules.tenant.dto.PhongBanResponse;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.modules.tenant.service.interfaces.PhongBanService;
import com.example.backend.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.backend.shared.response.PageResponse;

@RestController
@RequestMapping("/api/phong-ban")
@RequiredArgsConstructor
public class PhongBanController {

    private final PhongBanService phongBanService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_PHONG_BAN')")
    public ApiResponse<PageResponse<PhongBanResponse>> layDanhSach(
            @RequestParam(required = false) String tenPhongBan,
            @RequestParam(required = false) String maPhongBan,
            @RequestParam(required = false) String trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.success(phongBanService.layDanhSach(tenPhongBan, maPhongBan, trangThai, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_PHONG_BAN')")
    public ApiResponse<PhongBanResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(phongBanService.layTheoId(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_PHONG_BAN')")
    public ApiResponse<PhongBanResponse> themMoi(@Valid @RequestBody PhongBanRequest request) {
        return ApiResponse.success(phongBanService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_PHONG_BAN')")
    public ApiResponse<PhongBanResponse> capNhat(@PathVariable Long id, @Valid @RequestBody PhongBanRequest request) {
        return ApiResponse.success(phongBanService.capNhat(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_PHONG_BAN')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        phongBanService.xoaMem(id);
        return ApiResponse.success("Xóa phòng ban thành công");
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_PHONG_BAN')")
    public ApiResponse<String> capNhatTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody TrangThaiRequest request
    ) {
        phongBanService.capNhatTrangThai(id, request);
        return ApiResponse.success("Cập nhật trạng thái phòng ban thành công");
    }
}

