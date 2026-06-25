package com.example.backend.modules.report.controller;

import com.example.backend.modules.report.dto.ThongKeTongQuanDashboardResponse;
import com.example.backend.modules.report.service.interfaces.DashboardService;
import com.example.backend.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

     private final DashboardService dashboardService;

     @GetMapping("/don-vi")
     @PreAuthorize("hasAuthority('XEM_BAO_CAO')")
     public ApiResponse<ThongKeTongQuanDashboardResponse> layThongKeDonViAdmin() {
          return ApiResponse.success(dashboardService.layThongKeDonViAdmin());
     }

     @GetMapping("/toan-san")
     @PreAuthorize("hasAuthority('XEM_QUAN_TRI_TOAN_SAN')")
     public ApiResponse<Map<String, Object>> layThongKeToanSanSuperAdmin() {
          return ApiResponse.success(dashboardService.layThongKeToanSanSuperAdmin());
     }
}