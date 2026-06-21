package com.example.backend.modules.lifecycle.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhieuThanhLyTaiSanResponse {
     private Long id;
     private Long idDonVi;
     private String maPhieuThanhLy;
     private String tenNguoiLap;
     private String tenNguoiPheDuyet;
     private String hinhThucThanhLy;
     private BigDecimal tongTienThuHoi;
     private LocalDateTime thoiGianThanhLy;
     private String trangThaiLucGiao;
     private String lyDoThanhLy;
     private String trangThai;
     private LocalDateTime thoiGianTao;
     private LocalDateTime thoiGianCapNhat;

     @Schema(description = "Danh sách gộp chung phẳng toàn bộ tài sản thanh lý")
     private List<ChiTietThanhLyGeneralResponse> chiTietTaiSan;
}
