package com.example.backend.modules.asset.service.interfaces;

import com.example.backend.modules.asset.dto.LinhKienPhanCungRequest;
import com.example.backend.modules.asset.dto.LinhKienPhanCungResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.PageResponse;

import java.time.LocalDate;
import java.util.List;

public interface LinhKienPhanCungService {
    PageResponse<LinhKienPhanCungResponse> layDanhSach(
            String keyword,
            String trangThai,
            LocalDate tuNgayMua,
            LocalDate denNgayMua,
            String trangThaiKho,
            int page,
            int size,
            String sort
    );
    LinhKienPhanCungResponse layTheoId(Long id);
    LinhKienPhanCungResponse themMoi(LinhKienPhanCungRequest request);
    LinhKienPhanCungResponse capNhat(Long id, LinhKienPhanCungRequest request);
    void xoaMem(Long id);
    void capNhatTrangThai(Long id, TrangThaiRequest request);
    List<SelectOption> laySelectOptions(Long idTaiSanPhanCung);
    java.util.Optional<com.example.backend.modules.asset.model.LinhKienPhanCung> layEntityTheoId(Long id);
    void saveEntity(com.example.backend.modules.asset.model.LinhKienPhanCung entity);
    java.util.List<com.example.backend.modules.asset.model.LinhKienPhanCung> layTatCaActive();
    java.util.List<com.example.backend.modules.asset.model.LinhKienPhanCung> layTheoIds(java.util.Collection<Long> ids);
}
