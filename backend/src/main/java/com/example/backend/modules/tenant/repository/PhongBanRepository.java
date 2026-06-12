package com.example.backend.modules.tenant.repository;

import com.example.backend.modules.tenant.model.PhongBan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PhongBanRepository extends JpaRepository<PhongBan, Long>, JpaSpecificationExecutor<PhongBan> {
    List<PhongBan> findByDonViIdAndThoiGianXoaIsNull(Long idDonVi);
    Optional<PhongBan> findByIdAndThoiGianXoaIsNull(Long id);
    Optional<PhongBan> findByIdAndDonViIdAndThoiGianXoaIsNull(Long id, Long idDonVi);
    boolean existsByMaPhongBanAndDonViIdAndThoiGianXoaIsNull(String maPhongBan, Long idDonVi);

    @Modifying
    @Query("UPDATE PhongBan p SET p.trangThai = :trangThai WHERE p.donVi.id = :idDonVi AND p.thoiGianXoa IS NULL")
    void updateTrangThaiByDonViId(Long idDonVi, String trangThai);

    @Modifying
    @Query("UPDATE PhongBan p SET p.thoiGianXoa = :thoiGianXoa, p.lyDoXoa = :lyDoXoa WHERE p.donVi.id = :idDonVi AND p.thoiGianXoa IS NULL")
    void softDeleteByDonViId(Long idDonVi, LocalDateTime thoiGianXoa, String lyDoXoa);
}
