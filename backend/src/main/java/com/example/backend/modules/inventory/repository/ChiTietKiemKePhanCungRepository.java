package com.example.backend.modules.inventory.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.modules.inventory.model.ChiTietKiemKePhanCung;

public interface ChiTietKiemKePhanCungRepository extends JpaRepository<ChiTietKiemKePhanCung, Long> {
     List<ChiTietKiemKePhanCung> findByPhieuKiemKeIdAndThoiGianXoaIsNull(Long phieuId);
}
