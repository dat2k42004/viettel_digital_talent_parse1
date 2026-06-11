package com.example.backend.modules.tenant.service.interfaces;

import com.example.backend.modules.tenant.dto.DanhMucCauHinhRequest;
import com.example.backend.modules.tenant.dto.DanhMucCauHinhResponse;
import java.util.List;

public interface DanhMucCauHinhService {
    List<DanhMucCauHinhResponse> layDanhSach();
    DanhMucCauHinhResponse themMoi(DanhMucCauHinhRequest request);
    DanhMucCauHinhResponse capNhat(Long id, DanhMucCauHinhRequest request);
    void xoaMem(Long id);
}

