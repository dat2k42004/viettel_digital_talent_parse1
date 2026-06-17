package com.example.backend.modules.asset.service.interfaces;

import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.dto.TaiSanPhanMemRequest;
import com.example.backend.modules.asset.dto.TaiSanPhanMemResponse;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.PageResponse;

import java.util.List;

public interface TaiSanPhanMemService {
    PageResponse<TaiSanPhanMemResponse> layDanhSach(String keyword, String trangThai, int page, int size, String sort);
    TaiSanPhanMemResponse layTheoId(Long id);
    TaiSanPhanMemResponse themMoi(TaiSanPhanMemRequest request);
    TaiSanPhanMemResponse capNhat(Long id, TaiSanPhanMemRequest request);
    void xoaMem(Long id);
    void capNhatTrangThai(Long id, TrangThaiRequest request);
    List<SelectOption> laySelectOptions();
}
