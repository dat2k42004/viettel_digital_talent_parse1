package com.example.backend.modules.tenant.repository;

import com.example.backend.modules.tenant.model.ViTri;
import com.example.backend.shared.model.TrangThaiCoBanEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ViTriRepository extends JpaRepository<ViTri, Long>, JpaSpecificationExecutor<ViTri> {
    List<ViTri> findByDonViIdAndThoiGianXoaIsNull(Long idDonVi);
    Optional<ViTri> findByIdAndThoiGianXoaIsNull(Long id);
    Optional<ViTri> findByIdAndDonViIdAndThoiGianXoaIsNull(Long id, Long idDonVi);
    boolean existsByMaViTriAndDonViIdAndThoiGianXoaIsNull(String maViTri, Long idDonVi);

    @Modifying
    @Query("UPDATE ViTri v SET v.trangThai = :trangThai WHERE v.donVi.id = :idDonVi AND v.thoiGianXoa IS NULL")
    void updateTrangThaiByDonViId(Long idDonVi, TrangThaiCoBanEnum trangThai);

    @Modifying
    @Query("UPDATE ViTri v SET v.thoiGianXoa = :thoiGianXoa, v.lyDoXoa = :lyDoXoa WHERE v.donVi.id = :idDonVi AND v.thoiGianXoa IS NULL")
    void softDeleteByDonViId(Long idDonVi, LocalDateTime thoiGianXoa, String lyDoXoa);
}
