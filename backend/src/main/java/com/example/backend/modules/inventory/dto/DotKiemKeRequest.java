package com.example.backend.modules.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class DotKiemKeRequest {
     @NotBlank(message = "Tên đợt kiểm kê tài sản không được để trống")
     private String tenDotKiemKe;

     @NotNull(message = "Thời gian bắt đầu dự kiến không được để trống")
     private LocalDate thoiGianBatDauDuKien;

     @NotNull(message = "Thời gian kết thúc dự kiến không được để trống")
     private LocalDate thoiGianKetThucDuKien;
}