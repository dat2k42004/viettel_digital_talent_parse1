package com.example.backend.modules.tenant.service.interfaces;

import com.example.backend.modules.tenant.dto.DanhMucCauHinhRequest;
import com.example.backend.modules.tenant.dto.DanhMucCauHinhResponse;
import com.example.backend.shared.response.PageResponse;

public interface DanhMucCauHinhService {
    PageResponse<DanhMucCauHinhResponse> layDanhSach(String tenCauHinh, String maCauHinh, int page, int size);
    DanhMucCauHinhResponse themMoi(DanhMucCauHinhRequest request);
    DanhMucCauHinhResponse capNhat(Long id, DanhMucCauHinhRequest request);
    void xoaMem(Long id);
    DanhMucCauHinhResponse layTheoId(Long id);
}

