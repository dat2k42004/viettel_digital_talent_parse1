package com.example.backend.modules.asset.controller;

import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.dto.TaiSanPhanMemRequest;
import com.example.backend.modules.asset.dto.TaiSanPhanMemResponse;
import com.example.backend.modules.asset.service.interfaces.TaiSanPhanMemService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tai-san-phan-mem")
@RequiredArgsConstructor
public class TaiSanPhanMemController {

    private final TaiSanPhanMemService taiSanPhanMemService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_TAI_SAN_PHAN_MEM')")
    public ApiResponse<PageResponse<TaiSanPhanMemResponse>> layDanhSach(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        return ApiResponse.success(taiSanPhanMemService.layDanhSach(keyword, trangThai, page, size, sort));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_TAI_SAN_PHAN_MEM')")
    public ApiResponse<TaiSanPhanMemResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(taiSanPhanMemService.layTheoId(id));
    }

    @GetMapping("/select-options")
    @PreAuthorize("hasAuthority('XEM_TAI_SAN_PHAN_MEM')")
    public ApiResponse<List<SelectOption>> laySelectOptions(
            @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.success(taiSanPhanMemService.laySelectOptions(keyword));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_TAI_SAN_PHAN_MEM')")
    public ApiResponse<TaiSanPhanMemResponse> themMoi(@Valid @RequestBody TaiSanPhanMemRequest request) {
        return ApiResponse.success(taiSanPhanMemService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_TAI_SAN_PHAN_MEM')")
    public ApiResponse<TaiSanPhanMemResponse> capNhat(
            @PathVariable Long id,
            @Valid @RequestBody TaiSanPhanMemRequest request
    ) {
        return ApiResponse.success(taiSanPhanMemService.capNhat(id, request));
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_TAI_SAN_PHAN_MEM')")
    public ApiResponse<String> capNhatTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody TrangThaiRequest request
    ) {
        taiSanPhanMemService.capNhatTrangThai(id, request);
        return ApiResponse.success("Cập nhật trạng thái mẫu tài sản phần mềm thành công");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_TAI_SAN_PHAN_MEM')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        taiSanPhanMemService.xoaMem(id);
        return ApiResponse.success("Xóa mềm mẫu tài sản phần mềm thành công");
    }
}
