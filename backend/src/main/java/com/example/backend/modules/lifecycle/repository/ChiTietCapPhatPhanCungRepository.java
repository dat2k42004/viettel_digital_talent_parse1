package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.ChiTietCapPhatPhanCung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietCapPhatPhanCungRepository extends JpaRepository<ChiTietCapPhatPhanCung, Long>, JpaSpecificationExecutor<ChiTietCapPhatPhanCung> {
    List<ChiTietCapPhatPhanCung> findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(Long phieuId);
    List<ChiTietCapPhatPhanCung> findByPhieuCapPhatTaiSanIdNguoiNhanAndPhieuCapPhatTaiSanIdDonViAndThoiGianXoaIsNull(Long idNguoiNhan, Long idDonVi);
}
