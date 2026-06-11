package com.example.backend.modules.tenant.repository;

import com.example.backend.modules.tenant.model.CauHinhDonVi;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CauHinhDonViRepository extends JpaRepository<CauHinhDonVi, Long> {
    List<CauHinhDonVi> findByDonViIdAndThoiGianXoaIsNull(Long idDonVi);
    Optional<CauHinhDonVi> findByIdAndDonViIdAndThoiGianXoaIsNull(Long id, Long idDonVi);
    boolean existsByDanhMucCauHinhIdAndDonViIdAndThoiGianXoaIsNull(Long idDanhMucCauHinh, Long idDonVi);
}
