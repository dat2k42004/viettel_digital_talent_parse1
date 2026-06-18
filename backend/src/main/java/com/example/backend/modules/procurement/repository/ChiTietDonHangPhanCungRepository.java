package com.example.backend.modules.procurement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.modules.procurement.model.ChiTietDonHangPhanCung;
import com.example.backend.modules.procurement.model.DonHangMuaSam;

import java.util.List;

@Repository
public interface ChiTietDonHangPhanCungRepository extends JpaRepository<ChiTietDonHangPhanCung, Long> {
     List<ChiTietDonHangPhanCung> findByDonHangMuaSamAndThoiGianXoaIsNull(DonHangMuaSam donHangMuaSam);
}