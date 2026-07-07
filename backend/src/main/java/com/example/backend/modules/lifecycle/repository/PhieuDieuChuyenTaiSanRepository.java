package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.PhieuDieuChuyenTaiSan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PhieuDieuChuyenTaiSanRepository
          extends JpaRepository<PhieuDieuChuyenTaiSan, Long>, JpaSpecificationExecutor<PhieuDieuChuyenTaiSan> {
     Optional<PhieuDieuChuyenTaiSan> findByIdAndThoiGianXoaIsNull(Long id);

     Optional<PhieuDieuChuyenTaiSan> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);
}
