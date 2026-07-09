package com.example.backend.modules.tenant.controller;

import com.example.backend.modules.tenant.dto.ViTriRequest;
import com.example.backend.modules.tenant.dto.ViTriResponse;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.modules.tenant.service.interfaces.ViTriService;
import com.example.backend.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.backend.shared.response.PageResponse;

@RestController
@RequestMapping("/api/vi-tri")
@RequiredArgsConstructor
public class ViTriController {

    private final ViTriService viTriService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_VI_TRI')")
    public ApiResponse<PageResponse<ViTriResponse>> layDanhSach(
            @RequestParam(required = false) String tenViTri,
            @RequestParam(required = false) String maViTri,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String loaiViTri,
            @RequestParam(required = false) Long idDonVi,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.success(viTriService.layDanhSach(tenViTri, maViTri, trangThai, loaiViTri, idDonVi, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_VI_TRI')")
    public ApiResponse<ViTriResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(viTriService.layTheoId(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_VI_TRI')")
    public ApiResponse<ViTriResponse> themMoi(@Valid @RequestBody ViTriRequest request) {
        return ApiResponse.success(viTriService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_VI_TRI')")
    public ApiResponse<ViTriResponse> capNhat(@PathVariable Long id, @Valid @RequestBody ViTriRequest request) {
        return ApiResponse.success(viTriService.capNhat(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_VI_TRI')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        viTriService.xoaMem(id);
        return ApiResponse.success("Xóa vị trí thành công");
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_VI_TRI')")
    public ApiResponse<String> capNhatTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody TrangThaiRequest request
    ) {
        viTriService.capNhatTrangThai(id, request);
        return ApiResponse.success("Cập nhật trạng thái vị trí thành công");
    }
}

