package com.example.backend.modules.lifecycle.service.interfaces;

import com.example.backend.modules.lifecycle.dto.PhieuTonDongDto;
import java.time.LocalDateTime;
import java.util.List;

public interface LifecycleQueryService {
    List<PhieuTonDongDto> layDanhSachPhieuTonDong(Long idDonVi, LocalDateTime mocThoiGian);
    List<com.example.backend.modules.lifecycle.model.ChiTietCapPhatPhanCung> layPhanCungHoatDongTheoPhongBan(Long idPhongBan);
    List<com.example.backend.modules.lifecycle.model.ChiTietCapPhatLinhKien> layLinhKienHoatDongTheoPhongBan(Long idPhongBan);
    List<com.example.backend.modules.lifecycle.model.ChiTietCapPhatPhanMem> layPhanMemHoatDongTheoPhongBan(Long idPhongBan);
    long demCapPhatChoPheDuyet(Long idDonVi);
}
