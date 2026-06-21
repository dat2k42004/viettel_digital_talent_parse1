package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.ChiTietThanhLyPhanCung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChiTietThanhLyPhanCungRepository extends JpaRepository<ChiTietThanhLyPhanCung, Long> {
     List<ChiTietThanhLyPhanCung> findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(Long phieuId);
}
