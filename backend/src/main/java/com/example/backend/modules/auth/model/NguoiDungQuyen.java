package com.example.backend.modules.auth.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "nguoi_dung_quyen", indexes = {
    @Index(name = "idx_nd_quyen_nguoi_dung_quyen", columnList = "id_nguoi_dung, id_quyen")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_nguoi_dung_quyen_user_perm", columnNames = {"id_nguoi_dung", "id_quyen"})
})
public class NguoiDungQuyen extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nguoi_dung")
    private NguoiDung nguoiDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_quyen")
    private Quyen quyen;

    @Column(name = "id_don_vi")
    private Long idDonVi;

    @Column(name = "ten_quyen", length = 100)
    private String tenQuyen;

    @Column(name = "loai_quyen", length = 30)
    private String loaiQuyen;

    @Column(name = "duong_dan", length = 255)
    private String duongDan;

    @Column(name = "phuong_thuc_http", length = 10)
    private String phuongThucHttp;

    @Column(name = "thoi_gian")
    private LocalDateTime thoiGian;
}
