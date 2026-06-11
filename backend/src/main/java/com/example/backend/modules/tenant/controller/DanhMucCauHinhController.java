package com.example.backend.modules.tenant.controller;

import com.example.backend.modules.tenant.dto.DanhMucCauHinhRequest;
import com.example.backend.modules.tenant.dto.DanhMucCauHinhResponse;
import com.example.backend.modules.tenant.service.interfaces.DanhMucCauHinhService;
import com.example.backend.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/danh-muc-cau-hinh")
@RequiredArgsConstructor
public class DanhMucCauHinhController {

    private final DanhMucCauHinhService danhMucCauHinhService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_DANH_MUC_CAU_HINH')")
    public ApiResponse<List<DanhMucCauHinhResponse>> layDanhSach() {
        return ApiResponse.success(danhMucCauHinhService.layDanhSach());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_DANH_MUC_CAU_HINH')")
    public ApiResponse<DanhMucCauHinhResponse> themMoi(@Valid @RequestBody DanhMucCauHinhRequest request) {
        return ApiResponse.success(danhMucCauHinhService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_DANH_MUC_CAU_HINH')")
    public ApiResponse<DanhMucCauHinhResponse> capNhat(@PathVariable Long id, @Valid @RequestBody DanhMucCauHinhRequest request) {
        return ApiResponse.success(danhMucCauHinhService.capNhat(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_DANH_MUC_CAU_HINH')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        danhMucCauHinhService.xoaMem(id);
        return ApiResponse.success("Xóa danh mục cấu hình thành công");
    }
}

