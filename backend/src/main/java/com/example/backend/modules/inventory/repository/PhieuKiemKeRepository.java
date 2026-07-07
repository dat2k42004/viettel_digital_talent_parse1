package com.example.backend.modules.inventory.repository;

import com.example.backend.modules.inventory.model.PhieuKiemKe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PhieuKiemKeRepository extends JpaRepository<PhieuKiemKe, Long>, JpaSpecificationExecutor<PhieuKiemKe> {
     Optional<PhieuKiemKe> findByIdAndThoiGianXoaIsNull(Long id);

     Optional<PhieuKiemKe> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);

     List<PhieuKiemKe> findByDotKiemKeIdAndThoiGianXoaIsNull(Long dotKiemKeId);
}
