package com.example.backend.modules.asset.repository;

import com.example.backend.modules.asset.model.DanhSachThietBiPhanMem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DanhSachThietBiPhanMemRepository
        extends JpaRepository<DanhSachThietBiPhanMem, Long>, JpaSpecificationExecutor<DanhSachThietBiPhanMem> {
    Optional<DanhSachThietBiPhanMem> findByIdAndThoiGianXoaIsNull(Long id);

    Optional<DanhSachThietBiPhanMem> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);

    boolean existsByKeyBanQuyenAndIdDonViAndThoiGianXoaIsNull(String keyBanQuyen, Long idDonVi);

    long countByThoiGianXoaIsNull();
}
