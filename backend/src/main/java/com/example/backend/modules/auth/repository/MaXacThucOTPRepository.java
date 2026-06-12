package com.example.backend.modules.auth.repository;

import com.example.backend.modules.auth.model.MaXacThucOTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.Optional;

public interface MaXacThucOTPRepository extends JpaRepository<MaXacThucOTP, Long> {
    Optional<MaXacThucOTP> findFirstByNguoiDung_EmailAndLoaiMaAndTrangThaiOrderByThoiGianTaoDesc(String email, String loaiMa, String trangThai);

    @Modifying
    @Query("UPDATE MaXacThucOTP m SET m.thoiGianXoa = :thoiGianXoa, m.lyDoXoa = :lyDoXoa WHERE m.idDonVi = :idDonVi AND m.thoiGianXoa IS NULL")
    void softDeleteByIdDonVi(Long idDonVi, LocalDateTime thoiGianXoa, String lyDoXoa);
}
