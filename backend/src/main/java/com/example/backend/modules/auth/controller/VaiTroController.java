package com.example.backend.modules.auth.controller;

import com.example.backend.modules.auth.dto.VaiTroRequest;
import com.example.backend.modules.auth.dto.VaiTroResponse;
import com.example.backend.modules.auth.service.interfaces.VaiTroService;
import com.example.backend.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vai-tro")
@RequiredArgsConstructor
public class VaiTroController {

    private final VaiTroService vaiTroService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_VAI_TRO')")
    public ApiResponse<List<VaiTroResponse>> layDanhSach() {
        return ApiResponse.success(vaiTroService.layDanhSach());
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
}

