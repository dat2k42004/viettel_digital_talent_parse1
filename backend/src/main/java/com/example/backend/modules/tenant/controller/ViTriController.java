package com.example.backend.modules.tenant.controller;

import com.example.backend.modules.tenant.dto.ViTriRequest;
import com.example.backend.modules.tenant.dto.ViTriResponse;
import com.example.backend.modules.tenant.service.interfaces.ViTriService;
import com.example.backend.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vi-tri")
@RequiredArgsConstructor
public class ViTriController {

    private final ViTriService viTriService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_VI_TRI')")
    public ApiResponse<List<ViTriResponse>> layDanhSach() {
        return ApiResponse.success(viTriService.layDanhSach());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_VI_TRI')")
    public ApiResponse<ViTriResponse> themMoi(@Valid @RequestBody ViTriRequest request) {
        return ApiResponse.success(viTriService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_VI_TRI')")
    public ApiResponse<ViTriResponse> capNhat(@PathVariable Long id, @Valid @RequestBody ViTriRequest request) {
        return ApiResponse.success(viTriService.capNhat(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_VI_TRI')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        viTriService.xoaMem(id);
        return ApiResponse.success("Xóa vị trí thành công");
    }
}

