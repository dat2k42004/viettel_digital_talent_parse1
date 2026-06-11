package com.example.backend.modules.auth.repository;

import com.example.backend.modules.auth.model.PhienDangNhap;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PhienDangNhapRepository extends JpaRepository<PhienDangNhap, Long> {
    Optional<PhienDangNhap> findByTokenLamMoi(String tokenLamMoi);
}
