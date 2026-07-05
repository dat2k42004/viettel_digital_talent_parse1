package com.example.backend.modules.notification.controller;

import com.example.backend.modules.notification.service.interfaces.EmailThongBaoService;
import com.example.backend.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/thong-bao")
@RequiredArgsConstructor
public class EmailThongBaoController {

     private final EmailThongBaoService emailThongBaoService;

     @GetMapping("/nhac-nho-chung-tu")
     @PreAuthorize("hasAnyAuthority('XEM_BAO_CAO', 'XEM_QUAN_TRI_TOAN_SAN')")
     public ApiResponse<String> nhacNhoChungTu() {
          emailThongBaoService.nhacNhoChungTuTonDong();
          return ApiResponse.success("Đã kích hoạt quét và gửi email nhắc nhở chứng từ tồn đọng");
     }

     @GetMapping("/canh-bao-het-han")
     @PreAuthorize("hasAnyAuthority('XEM_BAO_CAO', 'XEM_QUAN_TRI_TOAN_SAN')")
     public ApiResponse<String> canhBaoHetHan() {
          emailThongBaoService.canhBaoHetHanTaiSan();
          return ApiResponse.success("Đã kích hoạt quét và gửi email cảnh báo tài sản sắp hết hạn");
     }
}
