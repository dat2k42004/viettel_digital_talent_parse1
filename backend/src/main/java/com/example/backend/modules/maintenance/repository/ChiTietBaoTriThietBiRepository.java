package com.example.backend.modules.maintenance.repository;

import com.example.backend.modules.maintenance.model.ChiTietBaoTriThietBi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChiTietBaoTriThietBiRepository extends JpaRepository<ChiTietBaoTriThietBi, Long> {
     List<ChiTietBaoTriThietBi> findByPhieuSuaChuaBaoTriIdAndThoiGianXoaIsNull(Long phieuId);
}