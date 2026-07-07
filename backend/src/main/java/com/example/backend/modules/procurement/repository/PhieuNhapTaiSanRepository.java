package com.example.backend.modules.procurement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.backend.modules.procurement.model.PhieuNhapTaiSan;

import java.util.Optional;

@Repository
public interface PhieuNhapTaiSanRepository
          extends JpaRepository<PhieuNhapTaiSan, Long>, JpaSpecificationExecutor<PhieuNhapTaiSan> {
     Optional<PhieuNhapTaiSan> findByIdAndThoiGianXoaIsNull(Long id);

     Optional<PhieuNhapTaiSan> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);
}
