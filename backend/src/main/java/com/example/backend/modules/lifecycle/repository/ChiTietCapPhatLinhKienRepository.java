package com.example.backend.modules.lifecycle.repository;

import com.example.backend.modules.lifecycle.model.ChiTietCapPhatLinhKien;

import io.lettuce.core.dynamic.annotation.Param;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietCapPhatLinhKienRepository
        extends JpaRepository<ChiTietCapPhatLinhKien, Long>, JpaSpecificationExecutor<ChiTietCapPhatLinhKien> {
    List<ChiTietCapPhatLinhKien> findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(Long phieuId);

    List<ChiTietCapPhatLinhKien> findByPhieuCapPhatTaiSanIdNguoiNhanAndPhieuCapPhatTaiSanIdDonViAndThoiGianXoaIsNull(
            Long idNguoiNhan, Long idDonVi);

    // lấy tài sản cấp phát theo phong ban
    @Query("SELECT c FROM ChiTietCapPhatLinhKien c WHERE c.phieuCapPhatTaiSan.idPhongBanNhan = :idPhongBan " +
            "AND c.phieuCapPhatTaiSan.trangThai = com.example.backend.shared.model.TrangThaiPhieuEnum.HOAN_THANH " +
            "AND c.thoiGianXoa IS NULL")
    List<ChiTietCapPhatLinhKien> findActiveAllocationByPhongBan(@Param("idPhongBan") Long idPhongBan);
}
