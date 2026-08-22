package com.example.backend.modules.lifecycle.model;

import java.math.BigDecimal;

import com.example.backend.shared.model.BaseEntity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_thanh_ly_phan_cung")
public class ChiTietThanhLyPhanCung extends BaseEntity {
     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "id_phieu_thanh_ly_tai_san", nullable = false)
     private PhieuThanhLyTaiSan phieuThanhLyTaiSan;

     @Column(name = "id_danh_sach_thiet_bi_phan_cung")
     private Long danhSachThietBiPhanCungId;

     @Column(name = "tien_thu_hoi", precision = 15, scale = 2)
     private BigDecimal tienThuHoi;

     @Column(name = "ghi_chu", columnDefinition = "TEXT")
     private String ghiChu;
}
