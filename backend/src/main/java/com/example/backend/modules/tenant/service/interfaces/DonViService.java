package com.example.backend.modules.tenant.service.interfaces;

import com.example.backend.modules.tenant.dto.DangKyDonViRequest;
import com.example.backend.modules.tenant.dto.XacThucOtpRequest;
import com.example.backend.modules.tenant.dto.DonViResponse;
import com.example.backend.modules.tenant.dto.DonViUpdateRequest;
import com.example.backend.modules.tenant.dto.DonViTrangThaiRequest;
import com.example.backend.modules.tenant.dto.GiaHanHopDongRequest;
import com.example.backend.shared.response.PageResponse;

public interface DonViService {
    void dangKyDonVi(DangKyDonViRequest request);
    void xacThucOtp(XacThucOtpRequest request);
    
    DonViResponse layTheoId(Long id);
    PageResponse<DonViResponse> layDanhSach(String ten, String maDonVi, String trangThai, String maSoThue, int page, int size);
    DonViResponse capNhatThongTin(Long id, DonViUpdateRequest request);
    void capNhatTrangThai(Long id, DonViTrangThaiRequest request);
    void xoaMem(Long id);
    boolean checkDomain(String domain);
    void giaHanHopDong(Long id, GiaHanHopDongRequest request);
}

