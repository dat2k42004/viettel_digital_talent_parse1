package com.example.backend.modules.tenant.repository;

import com.example.backend.modules.tenant.model.ViTri;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ViTriRepository extends JpaRepository<ViTri, Long> {
    List<ViTri> findByDonViIdAndThoiGianXoaIsNull(Long idDonVi);
    Optional<ViTri> findByIdAndDonViIdAndThoiGianXoaIsNull(Long id, Long idDonVi);
    boolean existsByMaViTriAndDonViIdAndThoiGianXoaIsNull(String maViTri, Long idDonVi);
}
