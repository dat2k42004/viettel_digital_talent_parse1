package com.example.backend.modules.auth.repository;

import com.example.backend.modules.auth.model.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NguoiDungRepository extends JpaRepository<NguoiDung, Long> {
    Optional<NguoiDung> findByTenDangNhapOrEmail(String tenDangNhap, String email);
    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);
    Optional<NguoiDung> findByIdAndThoiGianXoaIsNull(Long id);
    
    List<NguoiDung> findByIdDonViIsNullAndThoiGianXoaIsNull();
    List<NguoiDung> findByIdDonViAndThoiGianXoaIsNull(Long idDonVi);

    boolean existsByTenDangNhapAndThoiGianXoaIsNull(String tenDangNhap);
    boolean existsByEmailAndThoiGianXoaIsNull(String email);
}
