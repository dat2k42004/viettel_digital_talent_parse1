package com.example.backend.modules.lifecycle.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhieuDieuChuyenTaiSanResponse {
     private Long id;
     private Long idDonVi;
     private String maPhieuDieuChuyen;

     private Long idNguoiChuyen;
     private String tenNguoiChuyen;
     private Long idPhongBanChuyen;
     private String tenPhongBanChuyen;

     private Long idNguoiNhan;
     private String tenNguoiNhan;
     private Long idPhongBanNhan;
     private String tenPhongBanNhan;

     private String tenNguoiLap;
     private String tenNguoiPheDuyet;

     private String lyDoDieuChuyen;
     private LocalDateTime thoiGianBanGiao;
     private String trangThai;
     private LocalDateTime thoiGianTao;
     private LocalDateTime thoiGianCapNhat;

     @Schema(description = "Danh sách gộp phẳng toàn bộ thiết bị và linh kiện của phiếu điều chuyển")
     private List<ChiTietDieuChuyenGeneralResponse> chiTietTaiSan;
}
