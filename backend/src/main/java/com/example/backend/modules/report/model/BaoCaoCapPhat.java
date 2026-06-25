package com.example.backend.modules.report.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "bao_cao_cap_phat")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaoCaoCapPhat extends BaseEntity {

     @Column(name = "id_don_vi")
     private Long idDonVi;

     @Column(name = "id_phong_ban")
     private Long idPhongBan;

     @Column(name = "id_tai_san_danh_muc")
     private Long idTaiSanDanhMuc;

     @Column(name = "loai_tai_san")
     private String loaiTaiSan;

     @Column(name = "so_luong_cap")
     private Integer soLuongCap;

     @Column(name = "tong_gia_tri_cap", precision = 15, scale = 2)
     private BigDecimal tongGiaTriCap;

     // Thuộc tính bổ sung chuyên trách phục vụ kết xuất giao diện tức thời
     // (Real-world Pattern)
     @Column(name = "ten_phong_ban")
     private String tenPhongBan;

     @Column(name = "ten_tai_san_danh_muc")
     private String tenTaiSanDanhMuc;

     @Column(name = "ma_tai_san_danh_muc")
     private String maTaiSanDanhMuc;

     @OneToMany(mappedBy = "baoCaoCapPhat", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
     private List<ChiTietSuDung> danhSachChiTiet;
}