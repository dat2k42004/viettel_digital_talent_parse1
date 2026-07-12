package com.example.backend.modules.asset.service.interfaces;

import com.example.backend.modules.asset.dto.DanhMucTaiSanRequest;
import com.example.backend.modules.asset.dto.DanhMucTaiSanResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.PageResponse;

import java.util.List;

public interface DanhMucTaiSanService {
    PageResponse<DanhMucTaiSanResponse> layDanhSach(String keyword, String trangThai, int page, int size, String sort);
    DanhMucTaiSanResponse layTheoId(Long id);
    DanhMucTaiSanResponse themMoi(DanhMucTaiSanRequest request);
    DanhMucTaiSanResponse capNhat(Long id, DanhMucTaiSanRequest request);
    void xoaMem(Long id);
    void capNhatTrangThai(Long id, TrangThaiRequest request);
    List<SelectOption> laySelectOptions(String keyword);
}
