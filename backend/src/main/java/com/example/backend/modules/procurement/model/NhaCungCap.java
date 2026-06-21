package com.example.backend.modules.procurement.model;

import com.example.backend.shared.model.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import com.example.backend.shared.model.TrangThaiCoBanEnum;

@Getter
@Setter
@Entity
@Table(name = "nha_cung_cap", indexes = {
          @Index(name = "idx_ncc_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa")
})
public class NhaCungCap extends BaseEntity {
     @Column(name = "ma_nha_cung_cap", length = 50)
     private String maNhaCungCap;

     @Column(name = "id_don_vi")
     private Long idDonVi;

     @Column(name = "ten_nha_cung_cap", length = 255)
     private String tenNhaCungCap;

     @Column(name = "ma_so_thue", length = 20)
     private String maSoThue;

     @Column(name = "nguoi_lien_he", length = 100)
     private String nguoiLienHe;

     @Column(name = "so_dien_thoai", length = 20)
     private String soDienThoai;

     @Column(name = "email", length = 100)
     private String email;

     @Column(name = "dia_chi", length = 255)
     private String diaChi;

     @Column(name = "ghi_chu", columnDefinition = "TEXT")
     private String ghiChu;

     @Column(name = "trang_thai", length = 30)
     @Enumerated(EnumType.STRING)
     private TrangThaiCoBanEnum trangThai;
}
