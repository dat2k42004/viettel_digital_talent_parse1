package com.example.backend.modules.procurement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.modules.procurement.model.ChiTietNhapPhanCung;
import com.example.backend.modules.procurement.model.PhieuNhapTaiSan;

import java.util.List;

@Repository
public interface ChiTietNhapPhanCungRepository extends JpaRepository<ChiTietNhapPhanCung, Long> {
     List<ChiTietNhapPhanCung> findByPhieuNhapTaiSanAndThoiGianXoaIsNull(PhieuNhapTaiSan phieuNhapTaiSan);
}