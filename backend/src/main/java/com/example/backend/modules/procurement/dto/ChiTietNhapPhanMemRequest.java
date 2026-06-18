package com.example.backend.modules.procurement.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChiTietNhapPhanMemRequest {
     private Long id;

     @NotNull(message = "ID mẫu tài sản phần mềm không được để trống")
     private Long idTaiSanPhanMem;

     private Long idDanhSachThietBiPhanMem;

     @NotNull(message = "ID chi tiết đơn đặt hàng phần mềm không được để trống")
     private Long idChiTietDonHangPhanMem;

     @NotNull(message = "Số lượng ghế nhập không được để trống")
     private Integer soLuongGheNhap;

     @NotNull(message = "Giá nhập thực tế không được để trống")
     private BigDecimal giaNhapThucTe;
}