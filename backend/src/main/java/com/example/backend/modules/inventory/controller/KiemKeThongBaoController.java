package com.example.backend.modules.inventory.controller;

import com.example.backend.modules.inventory.service.interfaces.PhieuKiemKeService;
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
public class KiemKeThongBaoController {

     private final PhieuKiemKeService phieuKiemKeService;

     @GetMapping("/nhac-nho-kiem-ke")
     @PreAuthorize("hasAnyAuthority('XEM_BAO_CAO', 'XEM_QUAN_TRI_TOAN_SAN')")
     public ApiResponse<String> nhacNhoKiemKe() {
          phieuKiemKeService.nhacNhoKiemKe();
          return ApiResponse.success("Đã kích hoạt quét và gửi email nhắc nhở đợt kiểm kê đang thực hiện");
     }

     @GetMapping("/nhac-nho-kiem-ke-cu-the")
     @PreAuthorize("hasAnyAuthority('XEM_BAO_CAO', 'XEM_QUAN_TRI_TOAN_SAN')")
     public ApiResponse<String> nhacNhoKiemKeCuThe(@RequestParam Long idDotKiemKe) {
          phieuKiemKeService.nhacNhoTruongPhongKiemKe(idDotKiemKe);
          return ApiResponse.success("Đã kích hoạt gửi email nhắc nhở đợt kiểm kê cụ thể");
     }
}
