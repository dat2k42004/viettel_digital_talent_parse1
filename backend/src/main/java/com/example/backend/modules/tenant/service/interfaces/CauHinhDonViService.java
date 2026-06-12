package com.example.backend.modules.tenant.service.interfaces;

import com.example.backend.modules.tenant.dto.CauHinhDonViRequest;
import com.example.backend.modules.tenant.dto.CauHinhDonViResponse;
import com.example.backend.shared.response.PageResponse;

public interface CauHinhDonViService {
    PageResponse<CauHinhDonViResponse> layDanhSach(String tenCauHinh, int page, int size);
    CauHinhDonViResponse themMoi(CauHinhDonViRequest request);
    CauHinhDonViResponse capNhat(Long id, CauHinhDonViRequest request);
    void xoaMem(Long id);
    CauHinhDonViResponse layTheoId(Long id);
}

