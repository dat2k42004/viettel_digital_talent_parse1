package com.example.backend.modules.auth.service.interfaces;

import com.example.backend.modules.auth.dto.NguoiDungRequest;
import com.example.backend.modules.auth.dto.NguoiDungResponse;

import java.util.List;

public interface NguoiDungService {
    List<NguoiDungResponse> layDanhSach();
    NguoiDungResponse themMoi(NguoiDungRequest request);
    NguoiDungResponse capNhat(Long id, NguoiDungRequest request);
    void xoaMem(Long id);
}

