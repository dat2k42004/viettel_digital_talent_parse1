package com.example.backend.modules.asset.repository;

import com.example.backend.modules.asset.model.TaiSanPhanMem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface TaiSanPhanMemRepository
        extends JpaRepository<TaiSanPhanMem, Long>, JpaSpecificationExecutor<TaiSanPhanMem> {
    Optional<TaiSanPhanMem> findByIdAndThoiGianXoaIsNull(Long id);

    boolean existsByMaMauAndThoiGianXoaIsNull(String maMau);

    List<TaiSanPhanMem> findAllByIdInAndThoiGianXoaIsNull(Set<Long> ids);
}
