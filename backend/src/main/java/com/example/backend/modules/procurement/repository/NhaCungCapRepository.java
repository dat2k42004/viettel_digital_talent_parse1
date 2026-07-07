package com.example.backend.modules.procurement.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.backend.modules.procurement.model.NhaCungCap;

import com.example.backend.shared.model.TrangThaiCoBanEnum;

public interface NhaCungCapRepository extends JpaRepository<NhaCungCap, Long>, JpaSpecificationExecutor<NhaCungCap> {

     Optional<NhaCungCap> findByIdAndThoiGianXoaIsNull(Long id);

     Optional<NhaCungCap> findByIdAndIdDonViAndThoiGianXoaIsNull(Long id, Long idDonVi);

     List<NhaCungCap> findByIdDonViAndTrangThaiAndThoiGianXoaIsNull(Long idDonVi, TrangThaiCoBanEnum trangThai);

     List<NhaCungCap> findAllByIdInAndThoiGianXoaIsNull(Set<Long> ids);
}
