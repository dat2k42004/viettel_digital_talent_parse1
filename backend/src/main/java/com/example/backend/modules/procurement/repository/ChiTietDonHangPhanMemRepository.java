package com.example.backend.modules.procurement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.modules.procurement.model.ChiTietDonHangPhanMem;
import com.example.backend.modules.procurement.model.DonHangMuaSam;

import java.util.List;

@Repository
public interface ChiTietDonHangPhanMemRepository extends JpaRepository<ChiTietDonHangPhanMem, Long> {
     List<ChiTietDonHangPhanMem> findByDonHangMuaSamAndThoiGianXoaIsNull(DonHangMuaSam donHangMuaSam);
}
