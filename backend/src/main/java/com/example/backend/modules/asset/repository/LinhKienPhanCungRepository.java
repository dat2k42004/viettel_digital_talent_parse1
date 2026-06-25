package com.example.backend.modules.asset.repository;

import com.example.backend.modules.asset.model.LinhKienPhanCung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LinhKienPhanCungRepository
        extends JpaRepository<LinhKienPhanCung, Long>, JpaSpecificationExecutor<LinhKienPhanCung> {
    Optional<LinhKienPhanCung> findByIdAndThoiGianXoaIsNull(Long id);

    Optional<LinhKienPhanCung> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);

    boolean existsBySoSerialAndIdDonViAndThoiGianXoaIsNull(String soSerial, Long idDonVi);

    long countByThoiGianXoaIsNull();
}
