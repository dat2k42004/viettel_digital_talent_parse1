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
    java.util.List<com.example.backend.modules.asset.dto.SelectOption> laySelectOptions(Long idDonVi);
    java.util.Map<Long, String> layTenPhongBanTheoIds(java.util.Collection<Long> ids);
    void validatePhongBan(Long idPhongBan, Long idDonVi);
    java.util.List<PhongBanResponse> layPhongBanTheoDonViId(Long idDonVi);
}

