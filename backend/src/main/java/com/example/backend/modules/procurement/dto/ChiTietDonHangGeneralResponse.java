package com.example.backend.modules.procurement.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin chi tiết phẳng của đơn hàng mua sắm")
public class ChiTietDonHangGeneralResponse {
     private Long id;
     private Long idTaiSan;
     private String tenTaiSan;
     private Integer soLuongDat;
     private BigDecimal donGiaDat;
     private BigDecimal thanhTien;
     private Integer soLuongDaNhap;
     private String ghiChu;
     private String loai; // PHAN_CUNG, PHAN_MEM, LINH_KIEN
     private LocalDateTime thoiGianTao;
     private LocalDateTime thoiGianCapNhat;
}
