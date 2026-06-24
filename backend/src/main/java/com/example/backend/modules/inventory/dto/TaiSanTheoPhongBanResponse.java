package com.example.backend.modules.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaiSanTheoPhongBanResponse {
     private Long idPhongBan;
     private List<TaiSanCapPhatResponse> danhSachPhanCung;
     private List<TaiSanCapPhatResponse> danhSachLinhKien;
     private List<TaiSanCapPhatResponse> danhSachPhanMem;
}
