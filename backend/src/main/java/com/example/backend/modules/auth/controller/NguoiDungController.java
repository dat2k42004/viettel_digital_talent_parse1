package com.example.backend.modules.auth.controller;

import com.example.backend.modules.auth.dto.NguoiDungRequest;
import com.example.backend.modules.auth.dto.NguoiDungResponse;
import com.example.backend.modules.auth.dto.NguoiDungTrangThaiRequest;
import com.example.backend.modules.auth.dto.NguoiDungQuyenUpdateRequest;
import com.example.backend.modules.auth.service.interfaces.NguoiDungService;
import com.example.backend.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.backend.shared.response.PageResponse;

@RestController
@RequestMapping("/api/nguoi-dung")
@RequiredArgsConstructor
public class NguoiDungController {

    private final NguoiDungService nguoiDungService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_NGUOI_DUNG')")
    public ApiResponse<PageResponse<NguoiDungResponse>> layDanhSach(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.success(nguoiDungService.layDanhSach(search, trangThai, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_NGUOI_DUNG')")
    public ApiResponse<NguoiDungResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(nguoiDungService.layTheoId(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_NGUOI_DUNG')")
    public ApiResponse<NguoiDungResponse> themMoi(@Valid @RequestBody NguoiDungRequest request) {
        return ApiResponse.success(nguoiDungService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_NGUOI_DUNG')")
    public ApiResponse<NguoiDungResponse> capNhat(@PathVariable Long id, @Valid @RequestBody NguoiDungRequest request) {
        return ApiResponse.success(nguoiDungService.capNhat(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_NGUOI_DUNG')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        nguoiDungService.xoaMem(id);
        return ApiResponse.success("Xóa người dùng thành công");
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_NGUOI_DUNG')")
    public ApiResponse<String> capNhatTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody NguoiDungTrangThaiRequest request
    ) {
        nguoiDungService.capNhatTrangThai(id, request);
        return ApiResponse.success("Cập nhật trạng thái người dùng thành công");
    }

    @PutMapping("/{id}/quyen")
    @PreAuthorize("hasAuthority('CAP_NHAT_QUYEN_NGUOI_DUNG')")
    public ApiResponse<String> capNhatQuyen(
            @PathVariable Long id,
            @Valid @RequestBody NguoiDungQuyenUpdateRequest request
    ) {
        nguoiDungService.capNhatQuyenTrucTiep(id, request);
        return ApiResponse.success("Cập nhật quyền trực tiếp của người dùng thành công");
    }

    @PostMapping("/{id}/thu-hoi-phien")
    @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_NGUOI_DUNG')")
    public ApiResponse<String> thuHoiPhien(@PathVariable Long id) {
        nguoiDungService.thuHoiPhien(id);
        return ApiResponse.success("Đã cưỡng chế đăng xuất và hủy toàn bộ phiên làm việc của người dùng thành công");
    }
}

