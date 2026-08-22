package com.example.backend.modules.asset.controller;

import com.example.backend.modules.asset.dto.BackfillResult;
import com.example.backend.modules.asset.service.interfaces.AssetQrBackfillService;
import com.example.backend.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/asset-qr")
@RequiredArgsConstructor
@Tag(name = "Asset QR Management", description = "Quản lý mã QR và cơ chế xử lý nền cho tài sản")
public class AssetQrBackfillController {

    private final AssetQrBackfillService backfillService;

    @PostMapping("/backfill")
    @PreAuthorize("hasAuthority('XEM_QUAN_TRI_TOAN_SAN') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Quét bù mã QR cho toàn bộ dữ liệu tài sản cũ đang có qr_code_url = NULL")
    public ApiResponse<BackfillResult> triggerBackfill() {
        BackfillResult result = backfillService.backfillAllMissingQrCodes();
        return ApiResponse.success(result);
    }
}
