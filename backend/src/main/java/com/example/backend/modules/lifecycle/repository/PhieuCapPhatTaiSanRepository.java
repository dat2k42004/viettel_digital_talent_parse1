package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.PhieuCapPhatTaiSan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PhieuCapPhatTaiSanRepository extends JpaRepository<PhieuCapPhatTaiSan, Long>, JpaSpecificationExecutor<PhieuCapPhatTaiSan> {
    Optional<PhieuCapPhatTaiSan> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);
    Optional<PhieuCapPhatTaiSan> findByIdAndThoiGianXoaIsNull(Long id);
    boolean existsByMaPhiepCapPhatAndIdDonViAndThoiGianXoaIsNull(String maPhiepCapPhat, Long idDonVi);
}
