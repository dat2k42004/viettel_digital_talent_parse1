package com.example.backend.modules.auth.controller;

import com.example.backend.modules.auth.dto.VaiTroRequest;
import com.example.backend.modules.auth.dto.VaiTroResponse;
import com.example.backend.modules.auth.dto.VaiTroQuyenUpdateRequest;
import com.example.backend.modules.auth.dto.VaiTroDropdownResponse;
import com.example.backend.shared.dto.TrangThaiRequest;
import java.util.List;
import com.example.backend.modules.auth.service.interfaces.VaiTroService;
import com.example.backend.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.backend.shared.response.PageResponse;

@RestController
@RequestMapping("/api/vai-tro")
@RequiredArgsConstructor
public class VaiTroController {

    private final VaiTroService vaiTroService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_VAI_TRO')")
    public ApiResponse<PageResponse<VaiTroResponse>> layDanhSach(
            @RequestParam(required = false) String tenVaiTro,
            @RequestParam(required = false) String maVaiTro,
            @RequestParam(required = false) String trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(vaiTroService.layDanhSach(tenVaiTro, maVaiTro, trangThai, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_VAI_TRO')")
    public ApiResponse<VaiTroResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(vaiTroService.layTheoId(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_VAI_TRO')")
    public ApiResponse<VaiTroResponse> themMoi(@Valid @RequestBody VaiTroRequest request) {
        return ApiResponse.success(vaiTroService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_VAI_TRO')")
    public ApiResponse<VaiTroResponse> capNhat(@PathVariable Long id, @Valid @RequestBody VaiTroRequest request) {
        return ApiResponse.success(vaiTroService.capNhat(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_VAI_TRO')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        vaiTroService.xoaMem(id);
        return ApiResponse.success("Xóa vai trò thành công");
    }

    @PutMapping("/{id}/quyen")
    @PreAuthorize("hasAuthority('CAP_NHAT_QUYEN_VAI_TRO')")
    public ApiResponse<String> capNhatQuyen(
            @PathVariable Long id,
            @Valid @RequestBody VaiTroQuyenUpdateRequest request) {
        vaiTroService.capNhatQuyen(id, request);
        return ApiResponse.success("Cập nhật danh sách quyền của vai trò thành công");
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_VAI_TRO')")
    public ApiResponse<String> capNhatTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody TrangThaiRequest request) {
        vaiTroService.capNhatTrangThai(id, request);
        return ApiResponse.success("Cập nhật trạng thái vai trò thành công");
    }

    @GetMapping("/dropdown")
    @PreAuthorize("hasAuthority('XEM_VAI_TRO')")
    public ApiResponse<List<VaiTroDropdownResponse>> layDropdown(
            @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.success(vaiTroService.layDropdown(keyword));
    }
}
