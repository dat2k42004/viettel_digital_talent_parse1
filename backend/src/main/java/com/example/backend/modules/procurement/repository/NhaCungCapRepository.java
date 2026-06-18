package com.example.backend.modules.procurement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.backend.modules.procurement.model.NhaCungCap;

public interface NhaCungCapRepository extends JpaRepository<NhaCungCap, Long>, JpaSpecificationExecutor<NhaCungCap> {

     Optional<NhaCungCap> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);

     List<NhaCungCap> findByIdDonViAndTrangThaiAndThoiGianXoaIsNull(Long idDonVi, String trangThai);
}
