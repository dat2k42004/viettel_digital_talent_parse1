package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.ChiTietCapPhatPhanCung;

import io.lettuce.core.dynamic.annotation.Param;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietCapPhatPhanCungRepository
        extends JpaRepository<ChiTietCapPhatPhanCung, Long>, JpaSpecificationExecutor<ChiTietCapPhatPhanCung> {
    List<ChiTietCapPhatPhanCung> findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(Long phieuId);

    List<ChiTietCapPhatPhanCung> findByPhieuCapPhatTaiSanIdNguoiNhanAndPhieuCapPhatTaiSanIdDonViAndThoiGianXoaIsNull(
            Long idNguoiNhan, Long idDonVi);

    // lấy tài sản cấp phát theo phòng ban
    @Query("SELECT c FROM ChiTietCapPhatPhanCung c WHERE c.phieuCapPhatTaiSan.idPhongBanNhan = :idPhongBan " +
            "AND c.phieuCapPhatTaiSan.trangThai = com.example.backend.shared.model.TrangThaiPhieuEnum.HOAN_THANH " +
            "AND c.thoiGianXoa IS NULL")
    List<ChiTietCapPhatPhanCung> findActiveAllocationByPhongBan(@Param("idPhongBan") Long idPhongBan);
}
