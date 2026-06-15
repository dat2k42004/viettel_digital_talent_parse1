package com.example.backend.modules.auth.service.interfaces;

import com.example.backend.modules.auth.dto.QuyenResponse;

import java.util.List;
import java.util.Map;

public interface QuyenService {
    List<QuyenResponse> layDanhSachQuyen();
    Map<String, List<QuyenResponse>> layDanhSachQuyenPhanNhom();
}

