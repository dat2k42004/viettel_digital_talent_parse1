package com.example.backend.modules.procurement.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin phản hồi của phiếu nhập tài sản")
public class PhieuNhapTaiSanResponse {
     private Long id;
     private Long idDonVi;
     private Long idDonHangMuaSam;
     private String maDonHangMuaSam;

     @Schema(description = "Tên người thực hiện nhập kho")
     private String tenNguoiNhap;

     private String maPhieuNhap;
     private String soHoaDonVat;
     private String maBienBanGiaoHang;
     private LocalDateTime thoiGianNhapKho;
     private String trangThai;
     private String ghiChu;
     private LocalDateTime thoiGianTao;
     private LocalDateTime thoiGianCapNhat;

     @Schema(description = "Danh sách chi tiết tài sản của phiếu nhập")
     private List<ChiTietNhapTaiSanGeneralResponse> chiTietTaiSan;
}