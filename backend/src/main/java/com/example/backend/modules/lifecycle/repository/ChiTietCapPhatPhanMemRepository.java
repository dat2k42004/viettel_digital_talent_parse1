package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.ChiTietCapPhatPhanMem;

import io.lettuce.core.dynamic.annotation.Param;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietCapPhatPhanMemRepository
        extends JpaRepository<ChiTietCapPhatPhanMem, Long>, JpaSpecificationExecutor<ChiTietCapPhatPhanMem> {
    List<ChiTietCapPhatPhanMem> findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(Long phieuId);

    List<ChiTietCapPhatPhanMem> findByPhieuCapPhatTaiSanIdNguoiNhanAndPhieuCapPhatTaiSanIdDonViAndThoiGianXoaIsNull(
            Long idNguoiNhan, Long idDonVi);

    // lấy tài sản cấp phát theo phòng ban
    @Query("SELECT c FROM ChiTietCapPhatPhanMem c WHERE c.phieuCapPhatTaiSan.idPhongBanNhan = :idPhongBan " +
            "AND c.phieuCapPhatTaiSan.trangThai = com.example.backend.shared.model.TrangThaiPhieuEnum.HOAN_THANH " +
            "AND c.thoiGianXoa IS NULL")
    List<ChiTietCapPhatPhanMem> findActiveAllocationByPhongBan(@Param("idPhongBan") Long idPhongBan);
}
