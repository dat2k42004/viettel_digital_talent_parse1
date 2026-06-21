package com.example.backend.modules.auth.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "quyen", indexes = {
    @Index(name = "idx_quyen_ma_xoa", columnList = "ma_quyen, thoi_gian_xoa")
})
public class Quyen extends BaseEntity {

    @Column(name = "id_quyen_cha")
    private Long idQuyenCha;

    @Column(name = "ma_quyen", length = 50, unique = true)
    private String maQuyen;

    @Column(name = "ten_quyen", length = 100)
    private String tenQuyen;

    @Column(name = "loai_quyen", length = 30)
    private String loaiQuyen;

    @Column(name = "duong_dan", length = 255)
    private String duongDan;

    @Column(name = "biu_tuong", length = 50)
    private String biuTuong;

    @Column(name = "thu_tu_hien_thi")
    private Integer thuTuHienThi;

    @Column(name = "phuong_thuc_http", length = 10)
    private String phuongThucHttp;

    @Column(name = "trang_thai", length = 30)
    @Enumerated(EnumType.STRING)
    private com.example.backend.shared.model.TrangThaiCoBanEnum trangThai;
}
