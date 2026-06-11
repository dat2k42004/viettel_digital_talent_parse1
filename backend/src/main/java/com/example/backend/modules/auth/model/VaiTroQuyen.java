package com.example.backend.modules.auth.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "vai_tro_quyen")
public class VaiTroQuyen extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vai_tro")
    private VaiTro vaiTro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_quyen")
    private Quyen quyen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nguoi_cap_quyen")
    private NguoiDung nguoiCapQuyen;

    @Column(name = "ghi_chu_cap_quyen", columnDefinition = "TEXT")
    private String ghiChuCapQuyen;
}
