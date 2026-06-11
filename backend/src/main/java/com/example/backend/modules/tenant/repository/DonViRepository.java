package com.example.backend.modules.tenant.repository;

import com.example.backend.modules.tenant.model.DonVi;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DonViRepository extends JpaRepository<DonVi, Long> {
    Optional<DonVi> findByIdAndThoiGianXoaIsNull(Long id);
}
