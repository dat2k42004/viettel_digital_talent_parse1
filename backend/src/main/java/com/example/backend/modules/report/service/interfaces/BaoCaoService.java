package com.example.backend.modules.report.service.interfaces;

import com.example.backend.modules.report.dto.*;
import com.example.backend.shared.response.PageResponse;

public interface BaoCaoService {

     PageResponse<BaoCaoTonKhoResponse> layBaoCaoTonKho(BaoCaoFilterRequest request, int page, int size);

     PageResponse<BaoCaoCapPhatResponse> layBaoCaoCapPhat(BaoCaoFilterRequest request, int page, int size);

     PageResponse<BaoCaoBaoTriResponse> layBaoCaoBaoTri(BaoCaoFilterRequest request, int page, int size);

     PageResponse<BaoCaoToanSanSuperAdminResponse> layTongHopToanSanSuperAdmin(int page, int size);

     byte[] xuatFileBaoCao(BaoCaoFilterRequest request, String dinhDangFile);

     byte[] xuatFileBaoCaoToanSanSuperAdmin();
}