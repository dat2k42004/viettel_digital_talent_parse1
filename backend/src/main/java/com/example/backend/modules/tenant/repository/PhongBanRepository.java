package com.example.backend.modules.tenant.repository;

import com.example.backend.modules.tenant.model.PhongBan;
import com.example.backend.shared.model.TrangThaiCoBanEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface PhongBanRepository extends JpaRepository<PhongBan, Long>, JpaSpecificationExecutor<PhongBan> {
    List<PhongBan> findByDonViIdAndThoiGianXoaIsNull(Long idDonVi);

    Optional<PhongBan> findByIdAndThoiGianXoaIsNull(Long id);

    Optional<PhongBan> findByIdAndDonViIdAndThoiGianXoaIsNull(Long id, Long idDonVi);

    boolean existsByMaPhongBanAndDonViIdAndThoiGianXoaIsNull(String maPhongBan, Long idDonVi);

    List<PhongBan> findAllByIdInAndThoiGianXoaIsNull(Set<Long> ids);

    List<PhongBan> findAllByIdInAndThoiGianXoaIsNull(List<Long> ids);

    @Modifying
    @Query("UPDATE PhongBan p SET p.trangThai = :trangThai WHERE p.donVi.id = :idDonVi AND p.thoiGianXoa IS NULL")
    void updateTrangThaiByDonViId(Long idDonVi, TrangThaiCoBanEnum trangThai);

    @Modifying
    @Query("UPDATE PhongBan p SET p.thoiGianXoa = :thoiGianXoa, p.lyDoXoa = :lyDoXoa WHERE p.donVi.id = :idDonVi AND p.thoiGianXoa IS NULL")
    void softDeleteByDonViId(Long idDonVi, LocalDateTime thoiGianXoa, String lyDoXoa);
}
