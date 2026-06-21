package com.example.backend.modules.lifecycle.model;

import com.example.backend.shared.model.BaseEntity;
import com.example.backend.shared.model.TrangThaiPhieuEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "phieu_dieu_chuyen_tai_san", indexes = {
        @Index(name = "idx_pdcts_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa")
})
public class PhieuDieuChuyenTaiSan extends BaseEntity {

    @Column(name = "id_don_vi")
    private Long idDonVi;

    @Column(name = "ma_phieu_dieu_chuyen", length = 50)
    private String maPhieuDieuChuyen;

    @Column(name = "id_nguoi_chuyen")
    private Long idNguoiChuyen;

    @Column(name = "id_phong_ban_chuyen")
    private Long idPhongBanChuyen;

    @Column(name = "id_nguoi_nhan")
    private Long idNguoiNhan;

    @Column(name = "id_phong_ban_nhan")
    private Long idPhongBanNhan;

    @Column(name = "id_nguoi_lap")
    private Long idNguoiLap;

    @Column(name = "id_nguoi_phe_duyet")
    private Long idNguoiPheDuyet;

    @Column(name = "thoi_gian_ban_giao")
    private LocalDateTime thoiGianBanGiao;

    @Column(name = "ly_do_dieu_chuyen", columnDefinition = "TEXT")
    private String lyDoDieuChuyen;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", length = 30)
    private TrangThaiPhieuEnum trangThai;
}