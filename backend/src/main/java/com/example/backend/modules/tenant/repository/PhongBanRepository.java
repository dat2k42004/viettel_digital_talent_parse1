package com.example.backend.modules.tenant.repository;

import com.example.backend.modules.tenant.model.PhongBan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PhongBanRepository extends JpaRepository<PhongBan, Long> {
    List<PhongBan> findByDonViIdAndThoiGianXoaIsNull(Long idDonVi);
    Optional<PhongBan> findByIdAndDonViIdAndThoiGianXoaIsNull(Long id, Long idDonVi);
    boolean existsByMaPhongBanAndDonViIdAndThoiGianXoaIsNull(String maPhongBan, Long idDonVi);
}
