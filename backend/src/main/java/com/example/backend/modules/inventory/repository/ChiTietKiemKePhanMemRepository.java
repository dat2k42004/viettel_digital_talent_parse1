package com.example.backend.modules.inventory.repository;

import com.example.backend.modules.inventory.model.ChiTietKiemKePhanMem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChiTietKiemKePhanMemRepository extends JpaRepository<ChiTietKiemKePhanMem, Long> {
     List<ChiTietKiemKePhanMem> findByPhieuKiemKeIdAndThoiGianXoaIsNull(Long phieuId);
}
