package com.example.backend.modules.tenant.service.interfaces;

import com.example.backend.modules.tenant.dto.CauHinhDonViRequest;
import com.example.backend.modules.tenant.dto.CauHinhDonViResponse;
import com.example.backend.shared.response.PageResponse;
import java.util.List;

public interface CauHinhDonViService {
    PageResponse<CauHinhDonViResponse> layDanhSach(Long idDonVi, String tenCauHinh, int page, int size);
    CauHinhDonViResponse themMoi(Long idDonVi, CauHinhDonViRequest request);
    CauHinhDonViResponse capNhat(Long id, Long idDonVi, CauHinhDonViRequest request);
    void xoaMem(Long id, Long idDonVi);
    CauHinhDonViResponse layTheoId(Long id);
    List<CauHinhDonViResponse> layCauHinhMine(Long idDonVi);
}

