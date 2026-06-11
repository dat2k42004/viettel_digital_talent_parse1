package com.example.backend.modules.tenant.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "cau_hinh_don_vi")
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
