package com.example.backend.modules.tenant.service.interfaces;

import com.example.backend.modules.tenant.dto.PhongBanRequest;
import com.example.backend.modules.tenant.dto.PhongBanResponse;
import java.util.List;

public interface PhongBanService {
    List<PhongBanResponse> layDanhSach();
    PhongBanResponse themMoi(PhongBanRequest request);
    PhongBanResponse capNhat(Long id, PhongBanRequest request);
    void xoaMem(Long id);
}

