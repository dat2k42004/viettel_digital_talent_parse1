package com.example.backend.modules.procurement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.modules.procurement.model.ChiTietNhapPhanMem;
import com.example.backend.modules.procurement.model.PhieuNhapTaiSan;

import java.util.List;

@Repository
public interface ChiTietNhapPhanMemRepository extends JpaRepository<ChiTietNhapPhanMem, Long> {
     List<ChiTietNhapPhanMem> findByPhieuNhapTaiSanAndThoiGianXoaIsNull(PhieuNhapTaiSan phieuNhapTaiSan);
}
