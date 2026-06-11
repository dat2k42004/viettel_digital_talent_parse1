package com.example.backend.modules.tenant.service.interfaces;

import com.example.backend.modules.tenant.dto.ViTriRequest;
import com.example.backend.modules.tenant.dto.ViTriResponse;
import java.util.List;

public interface ViTriService {
    List<ViTriResponse> layDanhSach();
    ViTriResponse themMoi(ViTriRequest request);
    ViTriResponse capNhat(Long id, ViTriRequest request);
    void xoaMem(Long id);
}

