package com.example.backend.modules.procurement.repository;

import com.example.backend.modules.procurement.model.ChiTietNhapLinhKien;
import com.example.backend.modules.procurement.model.PhieuNhapTaiSan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietNhapLinhKienRepository extends JpaRepository<ChiTietNhapLinhKien, Long> {
     List<ChiTietNhapLinhKien> findByPhieuNhapTaiSanAndThoiGianXoaIsNull(PhieuNhapTaiSan phieuNhapTaiSan);
}