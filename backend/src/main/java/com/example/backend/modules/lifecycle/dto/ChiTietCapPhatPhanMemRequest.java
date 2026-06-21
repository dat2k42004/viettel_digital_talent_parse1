package com.example.backend.modules.lifecycle.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietCapPhatPhanMemRequest {

    @NotNull(message = "Thiết bị phần mềm không được để trống")
    private Long danhSachThietBiPhanMemId;

    private Long danhSachThietBiPhanCungId;

    @Size(max = 255, message = "Mã key kích hoạt không vượt quá 255 ký tự")
    private String maKeyKichHoat;

    private String ghiChu;
}
