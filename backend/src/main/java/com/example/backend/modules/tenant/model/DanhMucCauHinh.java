package com.example.backend.modules.tenant.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "danh_muc_cau_hinh")
public class DanhMucCauHinh extends BaseEntity {

    @Column(name = "ma_cau_hinh", length = 50)
    private String maCauHinh;

    @Column(name = "ten_cau_hinh", length = 150)
    private String tenCauHinh;

    @Column(name = "mo_ta_cau_hinh", columnDefinition = "TEXT")
    private String moTaCauHinh;

    @Column(name = "nhom_cau_hinh", length = 50)
    private String nhomCauHinh;

    @Column(name = "loai_du_lieu", length = 30)
    private String loaiDuLieu;

    @Column(name = "gia_tri_mac_dinh", length = 255)
    private String giaTriMacDinh;

    @Column(name = "trang_thai", length = 30)
    private String trangThai;
}
