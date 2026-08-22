package com.example.backend.modules.asset.repository;

import com.example.backend.modules.asset.model.LinhKienPhanCung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface LinhKienPhanCungRepository
        extends JpaRepository<LinhKienPhanCung, Long>, JpaSpecificationExecutor<LinhKienPhanCung> {
    Optional<LinhKienPhanCung> findByIdAndThoiGianXoaIsNull(Long id);

    Optional<LinhKienPhanCung> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);

    boolean existsBySoSerialAndIdDonViAndThoiGianXoaIsNull(String soSerial, Long idDonVi);

    List<LinhKienPhanCung> findAllByIdInAndThoiGianXoaIsNull(Set<Long> ids);

    long countByThoiGianXoaIsNull();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE LinhKienPhanCung l SET l.qrCodeUrl = :url WHERE l.id = :id")
    void updateQrCodeUrl(@org.springframework.data.repository.query.Param("id") Long id, @org.springframework.data.repository.query.Param("url") String url);

    org.springframework.data.domain.Page<LinhKienPhanCung> findAllByQrCodeUrlIsNullAndThoiGianXoaIsNull(org.springframework.data.domain.Pageable pageable);
}
