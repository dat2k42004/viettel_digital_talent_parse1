package com.example.backend.modules.asset.controller;

import com.example.backend.modules.asset.dto.DanhMucTaiSanRequest;
import com.example.backend.modules.asset.dto.DanhMucTaiSanResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.service.interfaces.DanhMucTaiSanService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/danh-muc-tai-san")
@RequiredArgsConstructor
public class DanhMucTaiSanController {

    private final DanhMucTaiSanService danhMucTaiSanService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_DANH_MUC_TAI_SAN')")
    public ApiResponse<PageResponse<DanhMucTaiSanResponse>> layDanhSach(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        return ApiResponse.success(danhMucTaiSanService.layDanhSach(keyword, trangThai, page, size, sort));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_DANH_MUC_TAI_SAN')")
    public ApiResponse<DanhMucTaiSanResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(danhMucTaiSanService.layTheoId(id));
    }

    @GetMapping("/select-options")
    @PreAuthorize("hasAuthority('XEM_DANH_MUC_TAI_SAN')")
    public ApiResponse<List<SelectOption>> laySelectOptions() {
        return ApiResponse.success(danhMucTaiSanService.laySelectOptions());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_DANH_MUC_TAI_SAN')")
    public ApiResponse<DanhMucTaiSanResponse> themMoi(@Valid @RequestBody DanhMucTaiSanRequest request) {
        return ApiResponse.success(danhMucTaiSanService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_DANH_MUC_TAI_SAN')")
    public ApiResponse<DanhMucTaiSanResponse> capNhat(
            @PathVariable Long id,
            @Valid @RequestBody DanhMucTaiSanRequest request
    ) {
        return ApiResponse.success(danhMucTaiSanService.capNhat(id, request));
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_DANH_MUC_TAI_SAN')")
    public ApiResponse<String> capNhatTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody TrangThaiRequest request
    ) {
        danhMucTaiSanService.capNhatTrangThai(id, request);
        return ApiResponse.success("Cập nhật trạng thái danh mục tài sản thành công");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_DANH_MUC_TAI_SAN')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        danhMucTaiSanService.xoaMem(id);
        return ApiResponse.success("Xóa mềm danh mục tài sản thành công");
    }
}
