package com.example.backend.modules.auth.controller;

import com.example.backend.modules.auth.dto.QuyenResponse;
import com.example.backend.modules.auth.service.interfaces.QuyenService;
import com.example.backend.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quyen")
@RequiredArgsConstructor
public class QuyenController {

    private final QuyenService quyenService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_QUYEN')")
    public ApiResponse<List<QuyenResponse>> layDanhSachQuyen() {
        List<QuyenResponse> responses = quyenService.layDanhSachQuyen();
        return ApiResponse.success(responses);
    }

    @GetMapping("/phan-nhom")
    @PreAuthorize("hasAuthority('XEM_QUYEN')")
    public ApiResponse<java.util.Map<String, List<QuyenResponse>>> layDanhSachQuyenPhanNhom() {
        return ApiResponse.success(quyenService.layDanhSachQuyenPhanNhom());
    }
}

