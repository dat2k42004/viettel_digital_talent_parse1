package com.example.backend.modules.asset.service.interfaces;

import com.example.backend.modules.asset.dto.BackfillResult;

public interface AssetQrBackfillService {
    BackfillResult backfillAllMissingQrCodes();
}
