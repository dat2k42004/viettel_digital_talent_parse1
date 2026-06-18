package com.example.backend.modules.procurement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PhieuNhapTaiSanRequest {

     @NotNull(message = "Đơn hàng mua sắm tham chiếu không được để trống")
     private Long idDonHangMuaSam;

     private Long idNguoiNhap;

     @NotBlank(message = "Mã phiếu nhập không được để trống")
     @Size(max = 50, message = "Mã phiếu nhập không được vượt quá 50 ký tự")
     private String maPhieuNhap;

     @Size(max = 100, message = "Số hóa đơn VAT không được vượt quá 100 ký tự")
     private String soHoaDonVat;

     @Size(max = 100, message = "Mã biên bản giao hàng không được vượt quá 100 ký tự")
     private String maBienBanGiaoHang;

     private LocalDateTime thoiGianNhapKho;
     private String ghiChu;

     private List<ChiTietNhapPhanCungRequest> chiTietPhanCung;
     private List<ChiTietNhapLinhKienRequest> chiTietLinhKien;
     private List<ChiTietNhapPhanMemRequest> chiTietPhanMem;
}