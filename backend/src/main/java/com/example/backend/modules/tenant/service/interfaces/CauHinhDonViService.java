package com.example.backend.modules.tenant.service.interfaces;

import com.example.backend.modules.tenant.dto.CauHinhDonViRequest;
import com.example.backend.modules.tenant.dto.CauHinhDonViResponse;
import java.util.List;

public interface CauHinhDonViService {
    List<CauHinhDonViResponse> layDanhSach();
    CauHinhDonViResponse themMoi(CauHinhDonViRequest request);
    CauHinhDonViResponse capNhat(Long id, CauHinhDonViRequest request);
    void xoaMem(Long id);
}

