package com.example.backend.modules.procurement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DonHangMuaSamRequest {

     @NotNull(message = "Nhà cung cấp không được để trống")
     private Long idNhaCungCap;

     private Long idNguoiLap;
     private Long idNguoiPheDuyet;

     @Size(max = 50, message = "Mã đơn hàng không được vượt quá 50 ký tự")
     private String maDonHang;

     @Size(max = 100, message = "Số hợp đồng không được vượt quá 100 ký tự")
     private String soHopDongDinhKem;

     @NotNull(message = "Tổng tiền trước thuế không được để trống")
     private BigDecimal tongTienTruocThue;

     @NotNull(message = "Thuế VAT không được để trống")
     private BigDecimal thueVat;

     @NotNull(message = "Tổng tiền sau thuế không được để trống")
     private BigDecimal tongTienSauThue;

     private LocalDate thoiGianGiaoDuKien;
     private String ghiChu;

     private List<ChiTietDonHangPhanCungRequest> chiTietPhanCung;
     private List<ChiTietDonHangPhanMemRequest> chiTietPhanMem;
}