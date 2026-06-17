package com.example.backend.modules.asset.repository;

import com.example.backend.modules.asset.model.LoaiTaiSan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoaiTaiSanRepository extends JpaRepository<LoaiTaiSan, Long>, JpaSpecificationExecutor<LoaiTaiSan> {
    Optional<LoaiTaiSan> findByIdAndThoiGianXoaIsNull(Long id);
    boolean existsByMaLoaiAndThoiGianXoaIsNull(String maLoai);
}
