package com.example.backend.modules.tenant.controller;

import com.example.backend.modules.tenant.dto.CauHinhDonViRequest;
import com.example.backend.modules.tenant.dto.CauHinhDonViResponse;
import com.example.backend.modules.tenant.service.interfaces.CauHinhDonViService;
import com.example.backend.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cau-hinh-don-vi")
@RequiredArgsConstructor
public class CauHinhDonViController {

    private final CauHinhDonViService cauHinhDonViService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_CAU_HINH_DON_VI')")
    public ApiResponse<List<CauHinhDonViResponse>> layDanhSach() {
        return ApiResponse.success(cauHinhDonViService.layDanhSach());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_CAU_HINH_DON_VI')")
    public ApiResponse<CauHinhDonViResponse> themMoi(@Valid @RequestBody CauHinhDonViRequest request) {
        return ApiResponse.success(cauHinhDonViService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_CAU_HINH_DON_VI')")
    public ApiResponse<CauHinhDonViResponse> capNhat(@PathVariable Long id, @Valid @RequestBody CauHinhDonViRequest request) {
        return ApiResponse.success(cauHinhDonViService.capNhat(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_CAU_HINH_DON_VI')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        cauHinhDonViService.xoaMem(id);
        return ApiResponse.success("Xóa cấu hình đơn vị thành công");
    }
}

