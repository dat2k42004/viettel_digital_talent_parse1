package com.example.backend.modules.lifecycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveAllocationResponse {
    private List<AllocatedHardwareResponse> danhSachPhanCung;
    private List<AllocatedSoftwareResponse> danhSachPhanMem;
    private List<AllocatedLinhKienResponse> danhSachLinhKien;
}
