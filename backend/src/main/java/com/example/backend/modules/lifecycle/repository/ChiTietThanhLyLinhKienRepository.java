package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.ChiTietThanhLyLinhKien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChiTietThanhLyLinhKienRepository extends JpaRepository<ChiTietThanhLyLinhKien, Long> {
     List<ChiTietThanhLyLinhKien> findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(Long phieuId);
}
