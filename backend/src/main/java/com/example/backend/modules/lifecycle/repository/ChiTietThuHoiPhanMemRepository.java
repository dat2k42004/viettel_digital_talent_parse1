package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.ChiTietThuHoiPhanMem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ChiTietThuHoiPhanMemRepository extends JpaRepository<ChiTietThuHoiPhanMem, Long>, JpaSpecificationExecutor<ChiTietThuHoiPhanMem> {
    Optional<ChiTietThuHoiPhanMem> findByChiTietCapPhatPhanMemIdAndThoiGianXoaIsNull(Long chiTietCapPhatPhanMemId);
    List<ChiTietThuHoiPhanMem> findByPhieuThuHoiTaiSanIdAndThoiGianXoaIsNull(Long phieuId);
}
