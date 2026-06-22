package com.example.backend.modules.maintenance.repository;

import com.example.backend.modules.maintenance.model.ChiTietKeHoachBaoTri;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChiTietKeHoachBaoTriRepository extends JpaRepository<ChiTietKeHoachBaoTri, Long> {
     List<ChiTietKeHoachBaoTri> findByKeHoachBaoTriDinhKyIdAndThoiGianXoaIsNull(Long keHoachId);
}