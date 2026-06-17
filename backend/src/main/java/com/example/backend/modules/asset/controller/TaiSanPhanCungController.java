package com.example.backend.modules.asset.controller;

import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.dto.TaiSanPhanCungRequest;
import com.example.backend.modules.asset.dto.TaiSanPhanCungResponse;
import com.example.backend.modules.asset.service.interfaces.TaiSanPhanCungService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tai-san-phan-cung")
@RequiredArgsConstructor
public class TaiSanPhanCungController {

    private final TaiSanPhanCungService taiSanPhanCungService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_TAI_SAN_PHAN_CUNG')")
    public ApiResponse<PageResponse<TaiSanPhanCungResponse>> layDanhSach(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        return ApiResponse.success(taiSanPhanCungService.layDanhSach(keyword, trangThai, page, size, sort));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_TAI_SAN_PHAN_CUNG')")
    public ApiResponse<TaiSanPhanCungResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(taiSanPhanCungService.layTheoId(id));
    }

    @GetMapping("/select-options")
    @PreAuthorize("hasAuthority('XEM_TAI_SAN_PHAN_CUNG')")
    public ApiResponse<List<SelectOption>> laySelectOptions() {
        return ApiResponse.success(taiSanPhanCungService.laySelectOptions());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_TAI_SAN_PHAN_CUNG')")
    public ApiResponse<TaiSanPhanCungResponse> themMoi(@Valid @RequestBody TaiSanPhanCungRequest request) {
        return ApiResponse.success(taiSanPhanCungService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_TAI_SAN_PHAN_CUNG')")
    public ApiResponse<TaiSanPhanCungResponse> capNhat(
            @PathVariable Long id,
            @Valid @RequestBody TaiSanPhanCungRequest request
    ) {
        return ApiResponse.success(taiSanPhanCungService.capNhat(id, request));
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_TAI_SAN_PHAN_CUNG')")
    public ApiResponse<String> capNhatTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody TrangThaiRequest request
    ) {
        taiSanPhanCungService.capNhatTrangThai(id, request);
        return ApiResponse.success("Cập nhật trạng thái mẫu tài sản phần cứng thành công");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_TAI_SAN_PHAN_CUNG')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        taiSanPhanCungService.xoaMem(id);
        return ApiResponse.success("Xóa mềm mẫu tài sản phần cứng thành công");
    }
}
