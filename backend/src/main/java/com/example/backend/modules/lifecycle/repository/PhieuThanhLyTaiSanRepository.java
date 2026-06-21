package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.PhieuThanhLyTaiSan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PhieuThanhLyTaiSanRepository
          extends JpaRepository<PhieuThanhLyTaiSan, Long>, JpaSpecificationExecutor<PhieuThanhLyTaiSan> {
     Optional<PhieuThanhLyTaiSan> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);
}
