package com.example.backend.modules.maintenance.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_ke_hoach_bao_tri", indexes = {
          @Index(name = "idx_ctkhbt_xoa", columnList = "thoi_gian_xoa")
})
public class ChiTietKeHoachBaoTri extends BaseEntity {

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "ke_hoach_bao_tri_dinh_ky", referencedColumnName = "id")
     private KeHoachBaoTriDinhKy keHoachBaoTriDinhKy;

     @Column(name = "id_tai_san_phan_cung")
     private Long idTaiSanPhanCung;
}
