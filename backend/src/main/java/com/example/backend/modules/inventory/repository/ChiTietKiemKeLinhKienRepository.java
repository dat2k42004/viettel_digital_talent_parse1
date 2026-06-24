package com.example.backend.modules.inventory.repository;

import com.example.backend.modules.inventory.model.ChiTietKiemKeLinhKien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChiTietKiemKeLinhKienRepository extends JpaRepository<ChiTietKiemKeLinhKien, Long> {
     List<ChiTietKiemKeLinhKien> findByPhieuKiemKeIdAndThoiGianXoaIsNull(Long phieuId);
}