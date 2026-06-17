package com.example.backend.modules.asset.service.interfaces;

import com.example.backend.modules.asset.dto.LapRapLinhKienResponse;
import com.example.backend.modules.asset.dto.LapRapLinhKienRequest;
import com.example.backend.shared.response.PageResponse;

public interface LapRapLinhKienService {
     LapRapLinhKienResponse themMoi(LapRapLinhKienRequest request);

     void capNhatThaoDo(Long id);

     PageResponse<LapRapLinhKienResponse> layDanhSach(
               Long thietBiPhanCungId,
               Long linhKienPhanCungId,
               String trangThaiLienKet,
               int page,
               int size,
               String sort);
}
