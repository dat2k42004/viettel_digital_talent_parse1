package com.example.backend.modules.lifecycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocatedSoftwareResponse {
    private Long chiTietCapPhatPhanMemId;
    private Long danhSachThietBiPhanMemId;
    private String tenPhanMem;
    private String keyBanQuyen;
}
