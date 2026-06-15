package com.example.backend.modules.auth.repository;

import com.example.backend.modules.auth.model.PhienDangNhap;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface PhienDangNhapRepository extends JpaRepository<PhienDangNhap, Long> {
    Optional<PhienDangNhap> findByTokenLamMoi(String tokenLamMoi);
    Optional<PhienDangNhap> findByTokenTruyCapAndThoiGianXoaIsNull(String tokenTruyCap);
    Optional<PhienDangNhap> findByTokenLamMoiAndThoiGianXoaIsNull(String tokenLamMoi);
    List<PhienDangNhap> findByNguoiDungIdAndTrangThaiAndThoiGianXoaIsNull(Long nguoiDungId, String trangThai);
}
