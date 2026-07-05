package com.example.backend.modules.asset.service.interfaces;

import com.example.backend.modules.asset.dto.DanhSachThietBiPhanMemRequest;
import com.example.backend.modules.asset.dto.DanhSachThietBiPhanMemResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.PageResponse;

import java.time.LocalDate;
import java.util.List;

public interface DanhSachThietBiPhanMemService {
    PageResponse<DanhSachThietBiPhanMemResponse> layDanhSach(
            String keyword,
            String trangThai,
            LocalDate tuNgayMua,
            LocalDate denNgayMua,
            LocalDate tuNgayHetHan,
            LocalDate denNgayHetHan,
            String trangThaiKho,
            int page,
            int size,
            String sort
    );
    DanhSachThietBiPhanMemResponse layTheoId(Long id);
    DanhSachThietBiPhanMemResponse themMoi(DanhSachThietBiPhanMemRequest request);
    DanhSachThietBiPhanMemResponse capNhat(Long id, DanhSachThietBiPhanMemRequest request);
    void xoaMem(Long id);
    void capNhatTrangThai(Long id, TrangThaiRequest request);
    List<SelectOption> laySelectOptions();
    java.util.Optional<com.example.backend.modules.asset.model.DanhSachThietBiPhanMem> layEntityTheoId(Long id);
    void saveEntity(com.example.backend.modules.asset.model.DanhSachThietBiPhanMem entity);
    java.util.List<com.example.backend.modules.asset.model.DanhSachThietBiPhanMem> layTatCaActive();
    java.util.List<com.example.backend.modules.asset.model.DanhSachThietBiPhanMem> layTheoIds(java.util.Collection<Long> ids);
}
