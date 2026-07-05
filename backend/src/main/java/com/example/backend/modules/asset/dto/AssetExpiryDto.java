package com.example.backend.modules.asset.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetExpiryDto {
    private String tenMau;
    private String identifier; // "Serial: ... | Thẻ: ...", etc.
    private LocalDate ngayHetHan;
    private String loaiTaiSan; // "Phần cứng" or "Phần mềm"
}
