package com.example.backend.modules.maintenance.repository;

import com.example.backend.modules.maintenance.model.PhieuSuaChuaBaoTri;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PhieuSuaChuaBaoTriRepository
          extends JpaRepository<PhieuSuaChuaBaoTri, Long>, JpaSpecificationExecutor<PhieuSuaChuaBaoTri> {
     Optional<PhieuSuaChuaBaoTri> findByIdAndThoiGianXoaIsNull(Long id);

     Optional<PhieuSuaChuaBaoTri> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);
}
