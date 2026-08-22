package com.example.backend.modules.report.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_su_dung")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietSuDung extends BaseEntity {

     @Column(name = "id_don_vi", nullable = false)
     private Long idDonVi;

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "bao_cao_cap_phat_id")
     private BaoCaoCapPhat baoCaoCapPhat;

     @Column(name = "id_tai_san_cu_the")
     private Long idTaiSanCuThe;

     @Column(name = "loai_tai_san")
     private String loaiTaiSan;

     @Column(name = "id_nhan_vien_tiep_nhan")
     private Long idNhanVienTiepNhan;

     @Column(name = "id_chung_tu_goc")
     private Long idChungTuGoc;

     @Column(name = "tinh_trang_ban_giao")
     private String tinhTrangBanGiao;

     @Column(name = "thoi_gian_thuc_hien")
     private LocalDateTime thoiGianThucHien;

     // Thuộc tính bổ sung chuyên trách phục vụ kết xuất giao diện tức thời
     // (Real-world Pattern)
     @Column(name = "ten_tai_san_cu_the")
     private String tenTaiSanCuThe;

     @Column(name = "so_serial")
     private String soSerial;

     @Column(name = "ma_the_tai_san")
     private String maTheTaiSan;

     @Column(name = "ho_ten_nhan_vien_tiep_nhan")
     private String hoTenNhanVienTiepNhan;

     @Column(name = "ma_chung_tu_goc")
     private String maChungTuGoc;
}