package com.example.backend.modules.asset.service.interfaces;

import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.dto.TaiSanPhanCungRequest;
import com.example.backend.modules.asset.dto.TaiSanPhanCungResponse;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.PageResponse;

import java.util.List;

public interface TaiSanPhanCungService {
    PageResponse<TaiSanPhanCungResponse> layDanhSach(String keyword, String trangThai, int page, int size, String sort);
    TaiSanPhanCungResponse layTheoId(Long id);
    TaiSanPhanCungResponse themMoi(TaiSanPhanCungRequest request);
    TaiSanPhanCungResponse capNhat(Long id, TaiSanPhanCungRequest request);
    void xoaMem(Long id);
    void capNhatTrangThai(Long id, TrangThaiRequest request);
    List<SelectOption> laySelectOptions();
    java.util.Optional<com.example.backend.modules.asset.model.TaiSanPhanCung> layEntityTheoId(Long id);
    void saveEntity(com.example.backend.modules.asset.model.TaiSanPhanCung entity);
    java.util.List<com.example.backend.modules.asset.model.TaiSanPhanCung> layTheoIds(java.util.Collection<Long> ids);
}
