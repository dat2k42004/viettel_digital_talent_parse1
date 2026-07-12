package com.example.backend.modules.procurement.service.interfaces;

import java.util.List;

import com.example.backend.modules.procurement.dto.SelectOption;
import com.example.backend.modules.procurement.dto.NhaCungCapRequest;
import com.example.backend.modules.procurement.dto.NhaCungCapResponse;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.PageResponse;

public interface NhaCungCapService {
     PageResponse<NhaCungCapResponse> layDanhSach(String keyword, String trangThai, int page, int size, String sort);

     NhaCungCapResponse layTheoId(Long id);

     List<SelectOption> laySelectOptions(String keyword);

     NhaCungCapResponse themMoi(NhaCungCapRequest request);

     NhaCungCapResponse capNhat(Long id, NhaCungCapRequest request);

     void capNhatTrangThai(Long id, TrangThaiRequest request);

     void xoaMem(Long id);
     java.util.Optional<com.example.backend.modules.procurement.model.NhaCungCap> layEntityTheoId(Long id);
     void saveEntity(com.example.backend.modules.procurement.model.NhaCungCap entity);
     java.util.Map<Long, String> layTenNhaCungCapTheoIds(java.util.Collection<Long> ids);
}
