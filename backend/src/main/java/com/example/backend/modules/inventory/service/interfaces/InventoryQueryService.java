package com.example.backend.modules.inventory.service.interfaces;

import com.example.backend.modules.inventory.dto.DotKiemKeDto;
import java.util.List;

public interface InventoryQueryService {
    List<DotKiemKeDto> layDotKiemKeDangThucHien(Long idDonVi);
    DotKiemKeDto layDotKiemKeTheoId(Long idDotKiemKe);
}
