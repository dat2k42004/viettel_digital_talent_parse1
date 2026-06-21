package com.example.backend.modules.lifecycle.model;

import com.example.backend.shared.model.BaseEntity;
import com.example.backend.shared.model.TrangThaiPhieuEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "phieu_thanh_ly_tai_san", indexes = {
        @Index(name = "idx_ptlts_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa")
})
public class PhieuThanhLyTaiSan extends BaseEntity {

    @Column(name = "id_don_vi")
    private Long idDonVi;

    @Column(name = "ma_phieu_thanh_ly", length = 50)
    private String maPhieuThanhLy;

    @Column(name = "id_nguoi_lap")
    private Long idNguoiLap;

    @Column(name = "id_nguoi_phe_duyet")
    private Long idNguoiPheDuyet;

    @Column(name = "hinh_thuc_thanh_ly", length = 50)
    private String hinhThucThanhLy;

    @Column(name = "tong_tien_thu_hoi", precision = 15, scale = 2)
    private BigDecimal tongTienThuHoi;

    @Column(name = "thoi_gian_thanh_ly")
    private LocalDateTime thoiGianThanhLy;

    @Column(name = "trang_thai_luc_giao", length = 100)
    private String trangThaiLucGiao;

    @Column(name = "ly_do_thanh_ly", columnDefinition = "TEXT")
    private String lyDoThanhLy;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", length = 30)
    private TrangThaiPhieuEnum trangThai;
}
