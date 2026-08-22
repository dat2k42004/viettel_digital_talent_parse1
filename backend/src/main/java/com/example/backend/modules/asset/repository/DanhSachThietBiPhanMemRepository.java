package com.example.backend.modules.asset.repository;

import com.example.backend.modules.asset.model.DanhSachThietBiPhanMem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface DanhSachThietBiPhanMemRepository
        extends JpaRepository<DanhSachThietBiPhanMem, Long>, JpaSpecificationExecutor<DanhSachThietBiPhanMem> {
    Optional<DanhSachThietBiPhanMem> findByIdAndThoiGianXoaIsNull(Long id);

    Optional<DanhSachThietBiPhanMem> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);

    boolean existsByKeyBanQuyenAndIdDonViAndThoiGianXoaIsNull(String keyBanQuyen, Long idDonVi);

    List<DanhSachThietBiPhanMem> findAllByIdInAndThoiGianXoaIsNull(Set<Long> ids);

    long countByThoiGianXoaIsNull();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE DanhSachThietBiPhanMem d SET d.qrCodeUrl = :url WHERE d.id = :id")
    void updateQrCodeUrl(@org.springframework.data.repository.query.Param("id") Long id, @org.springframework.data.repository.query.Param("url") String url);

    org.springframework.data.domain.Page<DanhSachThietBiPhanMem> findAllByQrCodeUrlIsNullAndThoiGianXoaIsNull(org.springframework.data.domain.Pageable pageable);
}
