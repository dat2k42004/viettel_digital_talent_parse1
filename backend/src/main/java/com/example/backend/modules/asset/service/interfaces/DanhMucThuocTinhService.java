package com.example.backend.modules.asset.service.interfaces;

import com.example.backend.modules.asset.dto.DanhMucThuocTinhRequest;
import com.example.backend.modules.asset.dto.DanhMucThuocTinhResponse;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.PageResponse;

public interface DanhMucThuocTinhService {
    PageResponse<DanhMucThuocTinhResponse> layDanhSach(String keyword, String apDungCho, int page, int size, String sort);
    DanhMucThuocTinhResponse layTheoId(Long id);
    DanhMucThuocTinhResponse themMoi(DanhMucThuocTinhRequest request);
    DanhMucThuocTinhResponse capNhat(Long id, DanhMucThuocTinhRequest request);
    void xoaMem(Long id);
    void capNhatTrangThai(Long id, TrangThaiRequest request);
}
