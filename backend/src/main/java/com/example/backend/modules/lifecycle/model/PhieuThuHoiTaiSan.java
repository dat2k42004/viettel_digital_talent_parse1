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
@Table(name = "phieu_thu_hoi_tai_san", indexes = {
        @Index(name = "idx_pthts_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa")
})
public class PhieuThuHoiTaiSan extends BaseEntity {

    @Column(name = "id_don_vi")
    private Long idDonVi;

    @Column(name = "ma_phieu_thu_hoi", length = 50)
    private String maPhieuThuHoi;

    @Column(name = "id_nhan_vien_tra")
    private Long idNhanVienTra;

    @Column(name = "id_phong_ban_tra")
    private Long idPhongBanTra;

    @Column(name = "id_nguoi_lap")
    private Long idNguoiLap;

    @Column(name = "id_nguoi_phe_duyet")
    private Long idNguoiPheDuyet;

    @Column(name = "ly_do_thu_hoi", columnDefinition = "TEXT")
    private String lyDoThuHoi;

    @Column(name = "thoi_gian_thu_hoi")
    private LocalDateTime thoiGianThuHoi;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", length = 30)
    private TrangThaiPhieuEnum trangThai;
}