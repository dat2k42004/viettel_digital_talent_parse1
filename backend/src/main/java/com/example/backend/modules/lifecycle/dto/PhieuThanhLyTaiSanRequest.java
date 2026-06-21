package com.example.backend.modules.lifecycle.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PhieuThanhLyTaiSanRequest {
     private String hinhThucThanhLy;
     private BigDecimal tongTienThuHoi;
     private String trangThaiLucGiao;
     private String lyDoThanhLy;

     @Valid
     private List<ChiTietThanhLyPhanCungRequest> danhSachPhanCung;

     @Valid
     private List<ChiTietThanhLyPhanMemRequest> danhSachPhanMem;

     @Valid
     private List<ChiTietThanhLyLinhKienRequest> danhSachLinhKien;
}
