package com.example.backend.modules.maintenance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChiTietKeHoachBaoTriRequest {
     @NotNull(message = "ID mẫu tài sản phần cứng không được để trống")
     private Long idTaiSanPhanCung;
}
