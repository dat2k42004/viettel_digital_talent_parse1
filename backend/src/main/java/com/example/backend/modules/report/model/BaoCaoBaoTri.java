package com.example.backend.modules.report.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "bao_cao_bao_tri")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaoCaoBaoTri extends BaseEntity {

     @Column(name = "id_don_vi")
     private Long idDonVi;

     @Column(name = "id_tai_san_danh_muc")
     private Long idTaiSanDanhMuc;

     @Column(name = "loai_tai_san")
     private String loaiTaiSan;

     @Column(name = "so_luong")
     private Integer soLuong;

     @Column(name = "tong_chi_phi", precision = 15, scale = 2)
     private BigDecimal tongChiPhi;

     @Column(name = "tong_thoi_gian")
     private Integer tongThoiGian;

     // Thuộc tính bổ sung chuyên trách phục vụ kết xuất giao diện tức thời
     // (Real-world Pattern)
     @Column(name = "ten_tai_san_danh_muc")
     private String tenTaiSanDanhMuc;

     @Column(name = "ma_tai_san_danh_muc")
     private String maTaiSanDanhMuc;

     @OneToMany(mappedBy = "baoCaoBaoTri", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
     private List<ChiTietBaoTri> danhSachChiTiet;
}