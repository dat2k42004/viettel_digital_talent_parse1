package com.example.backend.modules.procurement.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChiTietNhapPhanCungRequest {
     private Long id;

     @NotNull(message = "ID mẫu tài sản phần cứng không được để trống")
     private Long idTaiSanPhanCung;

     private Long idDanhSachThietBiPhanCung;

     @NotNull(message = "ID chi tiết đơn đặt hàng phần cứng không được để trống")
     private Long idChiTietDonHangPhanCung;

     @NotNull(message = "Giá nhập thực tế không được để trống")
     private BigDecimal giaNhapThuTe;

     private String tinhTrangLucNhap;
}
