package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.ChiTietDieuChuyenPhanCung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChiTietDieuChuyenPhanCungRepository extends JpaRepository<ChiTietDieuChuyenPhanCung, Long> {
     List<ChiTietDieuChuyenPhanCung> findByPhieuDieuChuyenTaiSanIdAndThoiGianXoaIsNull(Long phieuId);
}
