package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.ChiTietCapPhatPhanMem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietCapPhatPhanMemRepository extends JpaRepository<ChiTietCapPhatPhanMem, Long>, JpaSpecificationExecutor<ChiTietCapPhatPhanMem> {
    List<ChiTietCapPhatPhanMem> findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(Long phieuId);
    List<ChiTietCapPhatPhanMem> findByPhieuCapPhatTaiSanIdNguoiNhanAndPhieuCapPhatTaiSanIdDonViAndThoiGianXoaIsNull(Long idNguoiNhan, Long idDonVi);
}
