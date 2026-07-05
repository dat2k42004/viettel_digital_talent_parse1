package com.example.backend.modules.asset.service.interfaces;

import com.example.backend.modules.asset.dto.AssetExpiryDto;
import java.time.LocalDate;
import java.util.List;

public interface AssetQueryService {
    List<AssetExpiryDto> layTaiSanSapHetHan(Long idDonVi, LocalDate ngayHienTai, int soNgayCanhBao);
}
