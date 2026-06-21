package com.example.backend.modules.procurement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.backend.modules.procurement.model.DonHangMuaSam;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonHangMuaSamRepository
          extends JpaRepository<DonHangMuaSam, Long>, JpaSpecificationExecutor<DonHangMuaSam> {
     Optional<DonHangMuaSam> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);

     List<DonHangMuaSam> findByIdDonViAndTrangThaiAndThoiGianXoaIsNull(Long idDonVi, com.example.backend.shared.model.TrangThaiPhieuEnum trangThai);
}
