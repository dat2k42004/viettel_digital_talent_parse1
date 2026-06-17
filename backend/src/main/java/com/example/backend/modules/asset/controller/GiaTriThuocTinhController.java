package com.example.backend.modules.asset.controller;

import com.example.backend.modules.asset.dto.GiaTriThuocTinhBulkSaveRequest;
import com.example.backend.modules.asset.dto.GiaTriThuocTinhResponse;
import com.example.backend.modules.asset.service.interfaces.GiaTriThuocTinhService;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gia-tri-thuoc-tinh")
@RequiredArgsConstructor
@Validated
@Tag(name = "GiaTriThuocTinh", description = "API Vận hành Giá trị thuộc tính cụ thể của thiết bị (Multi-tenant)")
public class GiaTriThuocTinhController {

    private final GiaTriThuocTinhService giaTriThuocTinhService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_GIA_TRI_THUOC_TINH')")
    @Operation(summary = "Lấy danh sách giá trị thuộc tính thực tế phân trang (Multi-tenant)")
    public ApiResponse<PageResponse<GiaTriThuocTinhResponse>> layDanhSach(
            @RequestParam(value = "id_tai_san", required = false) Long idTaiSan,
            @RequestParam(value = "loai_tai_san", required = false) String loaiTaiSan,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        return ApiResponse.success(giaTriThuocTinhService.layDanhSach(idTaiSan, loaiTaiSan, page, size, sort));
    }

    @PostMapping("/save-bulk")
    @PreAuthorize("hasAuthority('LUU_GIA_TRI_THUOC_TINH')")
    @Operation(summary = "Lưu hàng loạt thông số kỹ thuật của tài sản khi nhập kho (Multi-tenant)")
    public ApiResponse<List<GiaTriThuocTinhResponse>> saveBulk(@Valid @RequestBody GiaTriThuocTinhBulkSaveRequest request) {
        return ApiResponse.success(giaTriThuocTinhService.saveBulk(request));
    }
}
