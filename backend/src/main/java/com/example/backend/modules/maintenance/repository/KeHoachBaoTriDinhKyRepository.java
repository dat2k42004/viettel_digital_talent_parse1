package com.example.backend.modules.maintenance.repository;

import com.example.backend.modules.maintenance.model.KeHoachBaoTriDinhKy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface KeHoachBaoTriDinhKyRepository
          extends JpaRepository<KeHoachBaoTriDinhKy, Long>, JpaSpecificationExecutor<KeHoachBaoTriDinhKy> {
     Optional<KeHoachBaoTriDinhKy> findByIdAndThoiGianXoaIsNull(Long id);

     Optional<KeHoachBaoTriDinhKy> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);
}
