package com.example.backend.modules.inventory.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PhieuKiemKeRequest {
     @NotNull(message = "ID đợt kiểm kê tổng không được để trống")
     private Long dotKiemKeId;

     @NotNull(message = "ID phòng ban thực hiện kiểm kê không được để trống")
     private Long idPhongBanKiemKe;

     private Long idKhoKiemKe;
}
