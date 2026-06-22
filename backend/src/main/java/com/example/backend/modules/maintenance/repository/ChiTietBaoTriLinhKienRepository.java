package com.example.backend.modules.maintenance.repository;

import com.example.backend.modules.maintenance.model.ChiTietBaoTriLinhKien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChiTietBaoTriLinhKienRepository extends JpaRepository<ChiTietBaoTriLinhKien, Long> {
     List<ChiTietBaoTriLinhKien> findByPhieuSuaChuaBaoTriIdAndThoiGianXoaIsNull(Long phieuId);
}
