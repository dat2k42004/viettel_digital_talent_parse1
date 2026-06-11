package com.example.backend.modules.auth.controller;

import com.example.backend.modules.auth.dto.NguoiDungRequest;
import com.example.backend.modules.auth.dto.NguoiDungResponse;
import com.example.backend.modules.auth.service.interfaces.NguoiDungService;
import com.example.backend.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nguoi-dung")
@RequiredArgsConstructor
public class NguoiDungController {

    private final NguoiDungService nguoiDungService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_NGUOI_DUNG')")
    public ApiResponse<List<NguoiDungResponse>> layDanhSach() {
        return ApiResponse.success(nguoiDungService.layDanhSach());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_NGUOI_DUNG')")
    public ApiResponse<NguoiDungResponse> themMoi(@Valid @RequestBody NguoiDungRequest request) {
        return ApiResponse.success(nguoiDungService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_NGUOI_DUNG')")
    public ApiResponse<NguoiDungResponse> capNhat(@PathVariable Long id, @Valid @RequestBody NguoiDungRequest request) {
        return ApiResponse.success(nguoiDungService.capNhat(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_NGUOI_DUNG')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        nguoiDungService.xoaMem(id);
        return ApiResponse.success("Xóaa ngưĐi dùng thểnh cóng");
    }
}

