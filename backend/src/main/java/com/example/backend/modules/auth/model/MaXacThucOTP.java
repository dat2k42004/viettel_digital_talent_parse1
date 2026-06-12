package com.example.backend.modules.auth.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "ma_xac_thuc_otp", indexes = {
    @Index(name = "idx_otp_nguoi_dung_loai_trang_thai", columnList = "id_nguoi_dung, loai_ma, trang_thai, thoi_gian_tao DESC")
})
public class MaXacThucOTP extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nguoi_dung")
    private NguoiDung nguoiDung;

    @Column(name = "id_don_vi")
    private Long idDonVi;

    @Column(name = "ma_xac_thuc_hash", length = 255)
    private String maXacThucHash;

    @Column(name = "loai_ma", length = 30)
    private String loaiMa;

    @Column(name = "phuong_thuc_gui", length = 30)
    private String phuongThucGui;

    @Column(name = "so_lan_sai_hien_tai")
    private Integer soLanSaiHienTai;

    @Column(name = "trang_thai", length = 30)
    private String trangThai;

    @Column(name = "thoi_gian_het_han")
    private LocalDateTime thoiGianHetHan;
}
