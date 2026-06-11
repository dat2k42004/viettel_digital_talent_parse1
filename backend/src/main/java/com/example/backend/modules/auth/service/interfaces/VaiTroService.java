package com.example.backend.modules.auth.service.interfaces;

import com.example.backend.modules.auth.dto.VaiTroRequest;
import com.example.backend.modules.auth.dto.VaiTroResponse;

import java.util.List;

public interface VaiTroService {
    List<VaiTroResponse> layDanhSach();
    VaiTroResponse themMoi(VaiTroRequest request);
    VaiTroResponse capNhat(Long id, VaiTroRequest request);
    void xoaMem(Long id);
}

