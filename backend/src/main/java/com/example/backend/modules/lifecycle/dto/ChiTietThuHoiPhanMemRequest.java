package com.example.backend.modules.lifecycle.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietThuHoiPhanMemRequest {

    @NotNull(message = "Chi tiết cấp phát phần mềm không được để trống")
    private Long chiTietCapPhatPhanMemId;

    private String ghiChu;
}
