package com.example.backend.modules.tenant.repository;

import com.example.backend.modules.tenant.model.DonVi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;

public interface DonViRepository extends JpaRepository<DonVi, Long>, JpaSpecificationExecutor<DonVi> {
    Optional<DonVi> findByIdAndThoiGianXoaIsNull(Long id);

    boolean existsByTenMienHeThongAndThoiGianXoaIsNull(String tenMienHeThong);

    long countByThoiGianXoaIsNull();

    java.util.List<DonVi> findByThoiGianXoaIsNull();
}
