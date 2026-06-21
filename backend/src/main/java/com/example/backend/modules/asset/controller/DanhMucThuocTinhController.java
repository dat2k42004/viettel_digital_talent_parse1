package com.example.backend.modules.asset.controller;

import com.example.backend.modules.asset.dto.DanhMucThuocTinhRequest;
import com.example.backend.modules.asset.dto.DanhMucThuocTinhResponse;
import com.example.backend.modules.asset.service.interfaces.DanhMucThuocTinhService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/danh-muc-thuoc-tinh")
@RequiredArgsConstructor
@Validated
public class DanhMucThuocTinhController {

    private final DanhMucThuocTinhService danhMucThuocTinhService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_DANH_MUC_THUOC_TINH')")
    public ApiResponse<PageResponse<DanhMucThuocTinhResponse>> layDanhSach(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String apDungCho,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        return ApiResponse.success(danhMucThuocTinhService.layDanhSach(keyword, apDungCho, page, size, sort));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_DANH_MUC_THUOC_TINH')")
    public ApiResponse<DanhMucThuocTinhResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(danhMucThuocTinhService.layTheoId(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_DANH_MUC_THUOC_TINH')")
    public ApiResponse<DanhMucThuocTinhResponse> themMoi(@Valid @RequestBody DanhMucThuocTinhRequest request) {
        return ApiResponse.success(danhMucThuocTinhService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_DANH_MUC_THUOC_TINH')")
    public ApiResponse<DanhMucThuocTinhResponse> capNhat(
            @PathVariable Long id,
            @Valid @RequestBody DanhMucThuocTinhRequest request
    ) {
        return ApiResponse.success(danhMucThuocTinhService.capNhat(id, request));
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_DANH_MUC_THUOC_TINH')")
    public ApiResponse<String> capNhatTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody TrangThaiRequest request
    ) {
        danhMucThuocTinhService.capNhatTrangThai(id, request);
        return ApiResponse.success("Cập nhật trạng thái danh mục thuộc tính thành công");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_DANH_MUC_THUOC_TINH')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        danhMucThuocTinhService.xoaMem(id);
        return ApiResponse.success("Xóa mềm danh mục thuộc tính thành công");
    }
}
