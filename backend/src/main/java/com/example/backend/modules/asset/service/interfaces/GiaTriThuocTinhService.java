package com.example.backend.modules.asset.service.interfaces;

import com.example.backend.modules.asset.dto.GiaTriThuocTinhBulkSaveRequest;
import com.example.backend.modules.asset.dto.GiaTriThuocTinhResponse;
import com.example.backend.shared.response.PageResponse;

import java.util.List;

public interface GiaTriThuocTinhService {
    PageResponse<GiaTriThuocTinhResponse> layDanhSach(Long idTaiSan, String loaiTaiSan, int page, int size, String sort);
    List<GiaTriThuocTinhResponse> saveBulk(GiaTriThuocTinhBulkSaveRequest request);
}
