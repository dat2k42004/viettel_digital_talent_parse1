package com.example.backend.modules.asset.repository;

import com.example.backend.modules.asset.model.GiaTriThuocTinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GiaTriThuocTinhRepository extends JpaRepository<GiaTriThuocTinh, Long>, JpaSpecificationExecutor<GiaTriThuocTinh> {
    Optional<GiaTriThuocTinh> findByIdAndThoiGianXoaIsNull(Long id);
    Optional<GiaTriThuocTinh> findByIdDonViAndLoaiTaiSanAndIdTaiSanAndDanhMucThuocTinhIdAndThoiGianXoaIsNull(Long idDonVi, String loaiTaiSan, Long idTaiSan, Long danhMucThuocTinhId);
    List<GiaTriThuocTinh> findByIdDonViAndLoaiTaiSanAndIdTaiSanAndThoiGianXoaIsNull(Long idDonVi, String loaiTaiSan, Long idTaiSan);
}
