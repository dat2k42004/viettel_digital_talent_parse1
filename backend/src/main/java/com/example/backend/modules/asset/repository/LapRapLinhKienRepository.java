package com.example.backend.modules.asset.repository;

import com.example.backend.modules.asset.model.LapRapLinhKien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LapRapLinhKienRepository
          extends JpaRepository<LapRapLinhKien, Long>, JpaSpecificationExecutor<LapRapLinhKien> {

     // Tìm kiếm bản ghi hợp lệ theo ID, cô lập Tenant và đảm bảo chưa bị xóa mềm
     Optional<LapRapLinhKien> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);
}
