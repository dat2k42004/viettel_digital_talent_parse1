package com.example.backend.modules.tenant.controller;

import com.example.backend.modules.tenant.dto.PhongBanRequest;
import com.example.backend.modules.tenant.dto.PhongBanResponse;
import com.example.backend.modules.tenant.service.interfaces.PhongBanService;
import com.example.backend.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/phong-ban")
@RequiredArgsConstructor
public class PhongBanController {

    private final PhongBanService phongBanService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_PHONG_BAN')")
    public ApiResponse<List<PhongBanResponse>> layDanhSach() {
        return ApiResponse.success(phongBanService.layDanhSach());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_PHONG_BAN')")
    public ApiResponse<PhongBanResponse> themMoi(@Valid @RequestBody PhongBanRequest request) {
        return ApiResponse.success(phongBanService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_PHONG_BAN')")
    public ApiResponse<PhongBanResponse> capNhat(@PathVariable Long id, @Valid @RequestBody PhongBanRequest request) {
        return ApiResponse.success(phongBanService.capNhat(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_PHONG_BAN')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        phongBanService.xoaMem(id);
        return ApiResponse.success("Xóa phòng ban thành công");
    }
}

