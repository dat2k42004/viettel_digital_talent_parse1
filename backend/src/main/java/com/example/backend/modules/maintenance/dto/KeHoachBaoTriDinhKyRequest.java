package com.example.backend.modules.maintenance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class KeHoachBaoTriDinhKyRequest {
     @NotBlank(message = "Tên kế hoạch bảo trì không được để trống")
     private String tenKeHoach;

     @NotBlank(message = "Chu kỳ lặp không được để trống")
     private String chuKyLap;

     @NotNull(message = "Thời gian bắt đầu kế hoạch không được để trống")
     private LocalDate thoiGianBatDauKeHoach;

     @NotNull(message = "Thời gian kết thúc kế hoạch không được để trống")
     private LocalDate thoiGianKetThucKeHoach;

     private BigDecimal chiPhiDuKien;
     private String noiDungBaoTri;

     @Valid
     private List<ChiTietKeHoachBaoTriRequest> danhSachChiTiet;
}
