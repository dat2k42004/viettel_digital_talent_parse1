package com.example.backend.modules.tenant.repository;

import com.example.backend.modules.tenant.model.CauHinhDonVi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CauHinhDonViRepository extends JpaRepository<CauHinhDonVi, Long>, JpaSpecificationExecutor<CauHinhDonVi> {
    List<CauHinhDonVi> findByDonViIdAndThoiGianXoaIsNull(Long idDonVi);
    Optional<CauHinhDonVi> findByIdAndThoiGianXoaIsNull(Long id);
    Optional<CauHinhDonVi> findByIdAndDonViIdAndThoiGianXoaIsNull(Long id, Long idDonVi);
    boolean existsByDanhMucCauHinhIdAndDonViIdAndThoiGianXoaIsNull(Long idDanhMucCauHinh, Long idDonVi);

    @Modifying
    @Query("UPDATE CauHinhDonVi c SET c.thoiGianXoa = :thoiGianXoa, c.lyDoXoa = :lyDoXoa WHERE c.donVi.id = :idDonVi AND c.thoiGianXoa IS NULL")
    void softDeleteByDonViId(Long idDonVi, LocalDateTime thoiGianXoa, String lyDoXoa);
}
