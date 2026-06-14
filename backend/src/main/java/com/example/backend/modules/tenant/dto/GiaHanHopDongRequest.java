package com.example.backend.modules.tenant.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class GiaHanHopDongRequest {
    @NotNull(message = "Ngày hết hạn mới không được để trống")
    private LocalDate ngayHetHanMoi;

    private String ghiChuGiaHan;
}
