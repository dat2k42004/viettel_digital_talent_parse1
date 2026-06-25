package com.example.backend.modules.report.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_ton_kho")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietTonKho extends BaseEntity {

     @Column(name = "id_don_vi")
     private Long idDonVi;

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "bao_cao_ton_kho_id")
     private BaoCaoTonKho baoCaoTonKho;

     @Column(name = "id_tai_san_cu_the")
     private Long idTaiSanCuThe;

     @Column(name = "loai_tai_san")
     private String loaiTaiSan;

     @Column(name = "vi_tri_kho")
     private String viTriKho;

     @Column(name = "trang_thai")
     private String trangThai;

     @Column(name = "id_dot_kiem_ke_gan_nhat")
     private Long idDotKiemKeGanNhat;

     @Column(name = "ghi_chu", columnDefinition = "TEXT")
     private String ghiChu;

     @Column(name = "thoi_gian_ghi_nhan")
     private LocalDateTime thoiGianGhiNhan;

     // Thuộc tính bổ sung chuyên trách phục vụ kết xuất giao diện tức thời
     // (Real-world Pattern)
     @Column(name = "ten_tai_san_cu_the")
     private String tenTaiSanCuThe;

     @Column(name = "so_serial")
     private String soSerial;

     @Column(name = "ma_the_tai_san")
     private String maTheTaiSan;

     @Column(name = "ten_dot_kiem_ke_gan_nhat")
     private String tenDotKiemKeGanNhat;
}