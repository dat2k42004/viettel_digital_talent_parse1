package com.example.backend.modules.tenant.repository;

import com.example.backend.modules.tenant.model.DanhMucCauHinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.util.Optional;

public interface DanhMucCauHinhRepository extends JpaRepository<DanhMucCauHinh, Long>, JpaSpecificationExecutor<DanhMucCauHinh> {
    List<DanhMucCauHinh> findByThoiGianXoaIsNull();
    Optional<DanhMucCauHinh> findByIdAndThoiGianXoaIsNull(Long id);
    boolean existsByMaCauHinhAndThoiGianXoaIsNull(String maCauHinh);
}
