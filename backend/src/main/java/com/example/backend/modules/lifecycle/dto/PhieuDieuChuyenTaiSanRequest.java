package com.example.backend.modules.lifecycle.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class PhieuDieuChuyenTaiSanRequest {
     @NotNull(message = "Nhân viên gửi không được để trống")
     private Long idNguoiChuyen;

     @NotNull(message = "Phòng ban gửi không được để trống")
     private Long idPhongBanChuyen;

     @NotNull(message = "Nhân viên nhận không được để trống")
     private Long idNguoiNhan;

     @NotNull(message = "Phòng ban nhận không được để trống")
     private Long idPhongBanNhan;

     private String lyDoDieuChuyen;

     @Valid
     private List<ChiTietDieuChuyenPhanCungRequest> danhSachPhanCung;

     @Valid
     private List<ChiTietDieuChuyenLinhKienRequest> danhSachLinhKien;
}
