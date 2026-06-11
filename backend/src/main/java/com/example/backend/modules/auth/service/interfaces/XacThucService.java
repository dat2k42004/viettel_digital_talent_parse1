package com.example.backend.modules.auth.service.interfaces;

import com.example.backend.modules.auth.dto.DangNhapRequest;
import com.example.backend.modules.auth.dto.XacThucResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface XacThucService {
    XacThucResponse login(DangNhapRequest request, HttpServletRequest httpRequest);
}

