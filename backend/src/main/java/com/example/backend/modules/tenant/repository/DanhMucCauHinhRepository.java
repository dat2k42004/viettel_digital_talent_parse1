package com.example.backend.modules.tenant.repository;

import com.example.backend.modules.tenant.model.DanhMucCauHinh;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DanhMucCauHinhRepository extends JpaRepository<DanhMucCauHinh, Long> {
    List<DanhMucCauHinh> findByThoiGianXoaIsNull();
    Optional<DanhMucCauHinh> findByIdAndThoiGianXoaIsNull(Long id);
    boolean existsByMaCauHinhAndThoiGianXoaIsNull(String maCauHinh);
}
