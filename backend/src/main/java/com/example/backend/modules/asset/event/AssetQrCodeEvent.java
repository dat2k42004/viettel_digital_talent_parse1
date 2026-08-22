package com.example.backend.modules.asset.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetQrCodeEvent implements Serializable {
    private Long assetId;
    private AssetType assetType;
    private String assetCode;
    private String tenantId;
    private LocalDateTime createdAt;
}
