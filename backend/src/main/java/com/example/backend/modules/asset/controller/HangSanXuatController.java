package com.example.backend.modules.asset.controller;

import com.example.backend.modules.asset.dto.HangSanXuatRequest;
import com.example.backend.modules.asset.dto.HangSanXuatResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.service.interfaces.HangSanXuatService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hang-san-xuat")
@RequiredArgsConstructor
public class HangSanXuatController {

    private final HangSanXuatService hangSanXuatService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_HANG_SAN_XUAT')")
    public ApiResponse<PageResponse<HangSanXuatResponse>> layDanhSach(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        return ApiResponse.success(hangSanXuatService.layDanhSach(keyword, trangThai, page, size, sort));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_HANG_SAN_XUAT')")
    public ApiResponse<HangSanXuatResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(hangSanXuatService.layTheoId(id));
    }

    @GetMapping("/select-options")
    @PreAuthorize("hasAuthority('XEM_HANG_SAN_XUAT')")
    public ApiResponse<List<SelectOption>> laySelectOptions(
            @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.success(hangSanXuatService.laySelectOptions(keyword));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_HANG_SAN_XUAT')")
    public ApiResponse<HangSanXuatResponse> themMoi(@Valid @RequestBody HangSanXuatRequest request) {
        return ApiResponse.success(hangSanXuatService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_HANG_SAN_XUAT')")
    public ApiResponse<HangSanXuatResponse> capNhat(
            @PathVariable Long id,
            @Valid @RequestBody HangSanXuatRequest request
    ) {
        return ApiResponse.success(hangSanXuatService.capNhat(id, request));
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_HANG_SAN_XUAT')")
    public ApiResponse<String> capNhatTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody TrangThaiRequest request
    ) {
        hangSanXuatService.capNhatTrangThai(id, request);
        return ApiResponse.success("Cập nhật trạng thái hãng sản xuất thành công");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_HANG_SAN_XUAT')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        hangSanXuatService.xoaMem(id);
        return ApiResponse.success("Xóa mềm hãng sản xuất thành công");
    }
}
