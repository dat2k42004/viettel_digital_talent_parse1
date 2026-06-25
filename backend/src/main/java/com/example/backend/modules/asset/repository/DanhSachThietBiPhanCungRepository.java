package com.example.backend.modules.asset.repository;

import com.example.backend.modules.asset.model.DanhSachThietBiPhanCung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DanhSachThietBiPhanCungRepository
        extends JpaRepository<DanhSachThietBiPhanCung, Long>, JpaSpecificationExecutor<DanhSachThietBiPhanCung> {
    Optional<DanhSachThietBiPhanCung> findByIdAndThoiGianXoaIsNull(Long id);

    Optional<DanhSachThietBiPhanCung> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);

    boolean existsBySoSerialAndIdDonViAndThoiGianXoaIsNull(String soSerial, Long idDonVi);

    boolean existsByMaTheTaiSanAndIdDonViAndThoiGianXoaIsNull(String maTheTaiSan, Long idDonVi);

    long countByThoiGianXoaIsNull();
}
