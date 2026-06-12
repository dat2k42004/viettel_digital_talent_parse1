package com.example.backend.modules.tenant.service.interfaces;

import com.example.backend.modules.tenant.dto.PhongBanRequest;
import com.example.backend.modules.tenant.dto.PhongBanResponse;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.PageResponse;

public interface PhongBanService {
    PageResponse<PhongBanResponse> layDanhSach(String tenPhongBan, String maPhongBan, String trangThai, int page, int size);
    PhongBanResponse themMoi(PhongBanRequest request);
    PhongBanResponse capNhat(Long id, PhongBanRequest request);
    void xoaMem(Long id);
    void capNhatTrangThai(Long id, TrangThaiRequest request);
    PhongBanResponse layTheoId(Long id);
}

