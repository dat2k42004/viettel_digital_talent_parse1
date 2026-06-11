package com.example.backend.modules.auth.repository;

import com.example.backend.modules.auth.model.MaXacThucOTP;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MaXacThucOTPRepository extends JpaRepository<MaXacThucOTP, Long> {
    Optional<MaXacThucOTP> findFirstByNguoiDung_EmailAndLoaiMaAndTrangThaiOrderByThoiGianTaoDesc(String email, String loaiMa, String trangThai);
}
