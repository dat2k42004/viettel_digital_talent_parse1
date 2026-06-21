package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.PhieuThuHoiTaiSan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PhieuThuHoiTaiSanRepository extends JpaRepository<PhieuThuHoiTaiSan, Long>, JpaSpecificationExecutor<PhieuThuHoiTaiSan> {
    Optional<PhieuThuHoiTaiSan> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);
    Optional<PhieuThuHoiTaiSan> findByIdAndThoiGianXoaIsNull(Long id);
    boolean existsByMaPhieuThuHoiAndIdDonViAndThoiGianXoaIsNull(String maPhieuThuHoi, Long idDonVi);
}
