package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.ChiTietThuHoiPhanCung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ChiTietThuHoiPhanCungRepository extends JpaRepository<ChiTietThuHoiPhanCung, Long>, JpaSpecificationExecutor<ChiTietThuHoiPhanCung> {
    Optional<ChiTietThuHoiPhanCung> findByChiTietCapPhatPhanCungIdAndThoiGianXoaIsNull(Long chiTietCapPhatPhanCungId);
    List<ChiTietThuHoiPhanCung> findByPhieuThuHoiTaiSanIdAndThoiGianXoaIsNull(Long phieuId);
}
