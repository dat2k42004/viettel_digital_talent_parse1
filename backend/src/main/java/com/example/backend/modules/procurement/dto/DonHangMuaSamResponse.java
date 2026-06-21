package com.example.backend.modules.procurement.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
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
public class DonHangMuaSamResponse {
     private Long id;
     private Long idDonVi;
     private Long idNhaCungCap;
     private String tenNhaCungCap;

     @Schema(description = "Tên người lập đơn hàng")
     private String tenNguoiLap;

     @Schema(description = "Tên người phê duyệt đơn hàng")
     private String tenNguoiPheDuyet;

     private String maDonHang;
     private String soHopDongDinhKem;
     private BigDecimal tongTienTruocThue;
     private BigDecimal thueVat;
     private BigDecimal tongTienSauThue;
     private LocalDate thoiGianGiaoDuKien;
     private String trangThai;
     private String ghiChu;
     private LocalDateTime thoiGianTao;
     private LocalDateTime thoiGianCapNhat;

     @Schema(description = "Danh sách chi tiết tài sản của đơn hàng mua sắm")
     private List<ChiTietDonHangGeneralResponse> chiTietTaiSan;
}
