package com.example.backend.modules.asset.controller;

import com.example.backend.modules.asset.dto.LoaiTaiSanRequest;
import com.example.backend.modules.asset.dto.LoaiTaiSanResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.service.interfaces.LoaiTaiSanService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loai-tai-san")
@RequiredArgsConstructor
public class LoaiTaiSanController {

    private final LoaiTaiSanService loaiTaiSanService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_LOAI_TAI_SAN')")
    public ApiResponse<PageResponse<LoaiTaiSanResponse>> layDanhSach(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        return ApiResponse.success(loaiTaiSanService.layDanhSach(keyword, trangThai, page, size, sort));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_LOAI_TAI_SAN')")
    public ApiResponse<LoaiTaiSanResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(loaiTaiSanService.layTheoId(id));
    }

    @GetMapping("/select-options")
    @PreAuthorize("hasAuthority('XEM_LOAI_TAI_SAN')")
    public ApiResponse<List<SelectOption>> laySelectOptions() {
        return ApiResponse.success(loaiTaiSanService.laySelectOptions());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_LOAI_TAI_SAN')")
    public ApiResponse<LoaiTaiSanResponse> themMoi(@Valid @RequestBody LoaiTaiSanRequest request) {
        return ApiResponse.success(loaiTaiSanService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_LOAI_TAI_SAN')")
    public ApiResponse<LoaiTaiSanResponse> capNhat(
            @PathVariable Long id,
            @Valid @RequestBody LoaiTaiSanRequest request
    ) {
        return ApiResponse.success(loaiTaiSanService.capNhat(id, request));
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_LOAI_TAI_SAN')")
    public ApiResponse<String> capNhatTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody TrangThaiRequest request
    ) {
        loaiTaiSanService.capNhatTrangThai(id, request);
        return ApiResponse.success("Cập nhật trạng thái loại tài sản thành công");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_LOAI_TAI_SAN')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        loaiTaiSanService.xoaMem(id);
        return ApiResponse.success("Xóa mềm loại tài sản thành công");
    }
}
