package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.ChiTietThanhLyPhanMem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChiTietThanhLyPhanMemRepository extends JpaRepository<ChiTietThanhLyPhanMem, Long> {
     List<ChiTietThanhLyPhanMem> findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(Long phieuId);
}
