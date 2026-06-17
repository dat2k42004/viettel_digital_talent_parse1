package com.example.backend.modules.asset.repository;

import com.example.backend.modules.asset.model.HangSanXuat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HangSanXuatRepository extends JpaRepository<HangSanXuat, Long>, JpaSpecificationExecutor<HangSanXuat> {
    Optional<HangSanXuat> findByIdAndThoiGianXoaIsNull(Long id);
    boolean existsByMaHangAndThoiGianXoaIsNull(String maHang);
}
