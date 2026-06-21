package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.ChiTietDieuChuyenLinhKien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChiTietDieuChuyenLinhKienRepository extends JpaRepository<ChiTietDieuChuyenLinhKien, Long> {
     List<ChiTietDieuChuyenLinhKien> findByPhieuDieuChuyenTaiSanIdAndThoiGianXoaIsNull(Long phieuId);
}
