package com.example.backend.modules.asset.service.interfaces;

import com.example.backend.modules.asset.dto.LoaiTaiSanRequest;
import com.example.backend.modules.asset.dto.LoaiTaiSanResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.PageResponse;

import java.util.List;

public interface LoaiTaiSanService {
    PageResponse<LoaiTaiSanResponse> layDanhSach(String keyword, String trangThai, int page, int size, String sort);
    LoaiTaiSanResponse layTheoId(Long id);
    LoaiTaiSanResponse themMoi(LoaiTaiSanRequest request);
    LoaiTaiSanResponse capNhat(Long id, LoaiTaiSanRequest request);
    void xoaMem(Long id);
    void capNhatTrangThai(Long id, TrangThaiRequest request);
    List<SelectOption> laySelectOptions(String keyword);
}
