package com.example.backend.modules.asset.repository;

import com.example.backend.modules.asset.model.TaiSanPhanCung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface TaiSanPhanCungRepository
        extends JpaRepository<TaiSanPhanCung, Long>, JpaSpecificationExecutor<TaiSanPhanCung> {
    Optional<TaiSanPhanCung> findByIdAndThoiGianXoaIsNull(Long id);

    boolean existsByMaMauAndThoiGianXoaIsNull(String maMau);

    List<TaiSanPhanCung> findAllByIdInAndThoiGianXoaIsNull(Set<Long> ids);
}
