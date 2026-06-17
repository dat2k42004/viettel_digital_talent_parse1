package com.example.backend.modules.asset.repository;

import com.example.backend.modules.asset.model.DanhMucThuocTinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DanhMucThuocTinhRepository extends JpaRepository<DanhMucThuocTinh, Long>, JpaSpecificationExecutor<DanhMucThuocTinh> {
    Optional<DanhMucThuocTinh> findByIdAndThoiGianXoaIsNull(Long id);
    boolean existsByMaThuocTinhAndThoiGianXoaIsNull(String maThuocTinh);
}
