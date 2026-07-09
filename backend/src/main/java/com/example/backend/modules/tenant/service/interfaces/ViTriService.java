package com.example.backend.modules.tenant.service.interfaces;

import com.example.backend.modules.tenant.dto.ViTriRequest;
import com.example.backend.modules.tenant.dto.ViTriResponse;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.PageResponse;

public interface ViTriService {
    PageResponse<ViTriResponse> layDanhSach(String tenViTri, String maViTri, String trangThai, String loaiViTri, Long idDonVi, int page, int size);
    ViTriResponse themMoi(ViTriRequest request);
    ViTriResponse capNhat(Long id, ViTriRequest request);
    void xoaMem(Long id);
    void capNhatTrangThai(Long id, TrangThaiRequest request);
    ViTriResponse layTheoId(Long id);
}

