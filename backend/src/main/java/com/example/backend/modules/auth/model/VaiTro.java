package com.example.backend.modules.auth.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "vai_tro")
public class VaiTro extends BaseEntity {

    @Column(name = "id_don_vi")
    private Long idDonVi;

    @Column(name = "ma_vai_tro", length = 50)
    private String maVaiTro;

    @Column(name = "ten_vai_tro", length = 100)
    private String tenVaiTro;

    @Column(name = "mo_ta_vai_tro", columnDefinition = "TEXT")
    private String moTaVaiTro;

    @Column(name = "la_he_thong")
    private Boolean laHeThong;

    @Column(name = "cap_do_uu_tien")
    private Integer capDoUuTien;

    @Column(name = "trang_thai", length = 30)
    private String trangThai;
}
