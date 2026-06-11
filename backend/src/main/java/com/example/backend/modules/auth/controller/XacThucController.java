package com.example.backend.modules.auth.controller;

import com.example.backend.modules.auth.dto.XacThucResponse;
import com.example.backend.modules.auth.dto.DangNhapRequest;
import com.example.backend.modules.auth.service.interfaces.XacThucService;
import com.example.backend.shared.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class XacThucController {

    private final XacThucService authService;

    @PostMapping("/login")
    public ApiResponse<XacThucResponse> login(@Valid @RequestBody DangNhapRequest request, HttpServletRequest httpRequest) {
        XacThucResponse response = authService.login(request, httpRequest);
        return ApiResponse.success(response);
    }
}

