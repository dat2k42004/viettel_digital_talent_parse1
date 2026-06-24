package com.example.backend.modules.inventory.repository;

import com.example.backend.modules.inventory.model.DotKiemKe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DotKiemKeRepository extends JpaRepository<DotKiemKe, Long>, JpaSpecificationExecutor<DotKiemKe> {
     Optional<DotKiemKe> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);
}
