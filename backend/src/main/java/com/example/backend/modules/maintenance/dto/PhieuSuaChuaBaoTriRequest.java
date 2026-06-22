package com.example.backend.modules.maintenance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PhieuSuaChuaBaoTriRequest {
     @NotNull(message = "Kế hoạch bảo trì định kỳ liên kết không được để trống")
     private Long keHoachBaoTriId;

     @NotNull(message = "Thời gian bắt đầu không được để trống")
     private LocalDateTime thoiGianBatDau;

     private LocalDateTime thoiGianHoanThanhDuKien;
     private String ghiChu;

     @Valid
     private List<ChiTietBaoTriThietBiRequest> danhSachThietBi;

     @Valid
     private List<ChiTietBaoTriLinhKienRequest> danhSachLinhKien;
}
