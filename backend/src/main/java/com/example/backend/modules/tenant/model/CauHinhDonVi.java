package com.example.backend.modules.tenant.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "cau_hinh_don_vi", indexes = {
    @Index(name = "idx_ch_don_vi_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa"),
    @Index(name = "idx_ch_don_vi_danh_muc_don_vi", columnList = "id_danh_muc_cau_hinh, id_don_vi, thoi_gian_xoa")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_ch_don_vi_danh_muc", columnNames = {"id_don_vi", "id_danh_muc_cau_hinh"})
})
public class CauHinhDonVi extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_don_vi")
    private DonVi donVi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_danh_muc_cau_hinh")
    private DanhMucCauHinh danhMucCauHinh;

    @Column(name = "gia_tri_cau_hinh", columnDefinition = "TEXT")
    private String giaTriCauHinh;
}
