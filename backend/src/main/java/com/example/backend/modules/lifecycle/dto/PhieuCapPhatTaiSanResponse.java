package com.example.backend.modules.lifecycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhieuCapPhatTaiSanResponse {
    private Long id;
    private Long idDonVi;
    private String maPhiepCapPhat;
    private Long idNguoiNhan;
    private String tenNguoiNhan;
    private Long idPhongBanNhan;
    private String tenPhongBanNhan;
    private Long idNguoiLap;
    private String tenNguoiLap;
    private Long idNguoiPheDuyet;
    private String tenNguoiPheDuyet;
    private LocalDateTime thoiGianBanGiao;
    private String trangThai;
    private String mucDichSuDung;

    @Builder.Default
    private List<ChiTietCapPhatGeneralResponse> danhSachTaiSan = new ArrayList<>();

    private LocalDateTime thoiGianTao;
    private LocalDateTime thoiGianCapNhat;
}
