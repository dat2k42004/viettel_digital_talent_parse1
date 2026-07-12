package com.example.backend.modules.asset.service.interfaces;

import com.example.backend.modules.asset.dto.HangSanXuatRequest;
import com.example.backend.modules.asset.dto.HangSanXuatResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.PageResponse;

import java.util.List;

public interface HangSanXuatService {
    PageResponse<HangSanXuatResponse> layDanhSach(String keyword, String trangThai, int page, int size, String sort);
    HangSanXuatResponse layTheoId(Long id);
    HangSanXuatResponse themMoi(HangSanXuatRequest request);
    HangSanXuatResponse capNhat(Long id, HangSanXuatRequest request);
    void xoaMem(Long id);
    void capNhatTrangThai(Long id, TrangThaiRequest request);
    List<SelectOption> laySelectOptions(String keyword);
}
