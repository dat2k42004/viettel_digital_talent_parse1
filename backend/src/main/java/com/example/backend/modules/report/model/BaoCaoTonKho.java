package com.example.backend.modules.report.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "bao_cao_ton_kho")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaoCaoTonKho extends BaseEntity {

     @Column(name = "id_don_vi", nullable = false)
     private Long idDonVi;

     @Column(name = "id_vi_tri")
     private Long idViTri;

     @Column(name = "id_tai_san_danh_muc")
     private Long idTaiSanDanhMuc;

     @Column(name = "loai_tai_san")
     private String loaiTaiSan;

     @Column(name = "so_luong_ton_kho")
     private Integer soLuongTonKho;

     // Thuộc tính bổ sung chuyên trách phục vụ kết xuất giao diện tức thời
     // (Real-world Pattern)
     @Column(name = "ten_tai_san_danh_muc")
     private String tenTaiSanDanhMuc;

     @Column(name = "ma_tai_san_danh_muc")
     private String maTaiSanDanhMuc;

     @Column(name = "ten_vi_tri")
     private String tenViTri;

     @OneToMany(mappedBy = "baoCaoTonKho", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
     private List<ChiTietTonKho> danhSachChiTiet;
}