package com.example.backend.modules.auth.service.interfaces;

import com.example.backend.modules.auth.dto.QuyenResponse;

import java.util.List;

public interface QuyenService {
    List<QuyenResponse> layDanhSachQuyen();
}

