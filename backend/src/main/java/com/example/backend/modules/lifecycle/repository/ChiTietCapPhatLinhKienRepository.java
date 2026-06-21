package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.ChiTietCapPhatLinhKien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietCapPhatLinhKienRepository extends JpaRepository<ChiTietCapPhatLinhKien, Long>, JpaSpecificationExecutor<ChiTietCapPhatLinhKien> {
    List<ChiTietCapPhatLinhKien> findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(Long phieuId);
    List<ChiTietCapPhatLinhKien> findByPhieuCapPhatTaiSanIdNguoiNhanAndPhieuCapPhatTaiSanIdDonViAndThoiGianXoaIsNull(Long idNguoiNhan, Long idDonVi);
}
