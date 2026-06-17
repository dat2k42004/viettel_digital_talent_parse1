package com.example.backend.modules.asset.repository;

import com.example.backend.modules.asset.model.DanhMucTaiSan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DanhMucTaiSanRepository extends JpaRepository<DanhMucTaiSan, Long>, JpaSpecificationExecutor<DanhMucTaiSan> {
    Optional<DanhMucTaiSan> findByIdAndThoiGianXoaIsNull(Long id);
    boolean existsByMaDanhMucAndThoiGianXoaIsNull(String maDanhMuc);
}
