package com.example.backend.modules.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DotKiemKeDto {
    private Long id;
    private String tenDotKiemKe;
    private String maDotKiemKe;
    private LocalDate thoiGianBatDauDuKien;
    private LocalDate thoiGianKetThucDuKien;
    private Long idDonVi;
}
