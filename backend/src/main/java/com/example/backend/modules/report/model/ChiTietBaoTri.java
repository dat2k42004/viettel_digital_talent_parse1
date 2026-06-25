package com.example.backend.modules.report.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_bao_tri")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietBaoTri extends BaseEntity {

     @Column(name = "id_don_vi")
     private Long idDonVi;

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "bao_cao_bao_tri_id")
     private BaoCaoBaoTri baoCaoBaoTri;

     @Column(name = "id_tai_san_cu_the")
     private Long idTaiSanCuThe;

     @Column(name = "loai_tai_san")
     private String loaiTaiSan;

     @Column(name = "id_phieu_sua_chua")
     private Long idPhieuSuaChua;

     @Column(name = "chi_phi_thuc_te", precision = 15, scale = 2)
     private BigDecimal chiPhiThucTe;

     @Column(name = "thoi_gian_gian_doan")
     private Integer thoiGianGianDoan;

     @Column(name = "noi_dung_khac_phuc", columnDefinition = "TEXT")
     private String noiDungKhacPhuc;

     @Column(name = "thoi_gian_nghiem_thu")
     private LocalDateTime thoiGianNghiemThu;

     // Thuộc tính bổ sung chuyên trách phục vụ kết xuất giao diện tức thời
     // (Real-world Pattern)
     @Column(name = "ten_tai_san_cu_the")
     private String tenTaiSanCuThe;

     @Column(name = "so_serial")
     private String soSerial;

     @Column(name = "ma_the_tai_san")
     private String maTheTaiSan;

     @Column(name = "ma_phieu_sua_chua")
     private String maPhieuSuaChua;
}