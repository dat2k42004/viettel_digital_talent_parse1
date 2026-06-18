package com.example.backend.modules.procurement.service.interfaces;

import com.example.backend.modules.procurement.dto.PhieuNhapTaiSanRequest;
import com.example.backend.modules.procurement.dto.PhieuNhapTaiSanResponse;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.PageResponse;

public interface PhieuNhapTaiSanService {
     PageResponse<PhieuNhapTaiSanResponse> layDanhSach(String maPhieuNhap, String soHoaDonVat, Long idDonHangMuaSam,
               String trangThai, int page, int size, String sort);

     PhieuNhapTaiSanResponse layTheoId(Long id);

     PhieuNhapTaiSanResponse themMoi(PhieuNhapTaiSanRequest request);

     PhieuNhapTaiSanResponse capNhat(Long id, PhieuNhapTaiSanRequest request);

     void capNhatTrangThai(Long id, TrangThaiRequest request);

     void xoaMem(Long id);
}
