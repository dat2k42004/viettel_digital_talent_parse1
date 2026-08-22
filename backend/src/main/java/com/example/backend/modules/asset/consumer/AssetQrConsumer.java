package com.example.backend.modules.asset.consumer;

import com.example.backend.modules.asset.event.AssetQrCodeEvent;
import com.example.backend.modules.asset.event.AssetType;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanCungRepository;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanMemRepository;
import com.example.backend.modules.asset.repository.LinhKienPhanCungRepository;
import com.example.backend.modules.asset.service.interfaces.QrCodeService;
import com.example.backend.modules.asset.service.interfaces.QrStorageService;
import com.example.backend.shared.config.RabbitMQConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AssetQrConsumer {

    private final QrCodeService qrCodeService;
    private final QrStorageService qrStorageService;
    private final DanhSachThietBiPhanCungRepository thietBiPhanCungRepository;
    private final LinhKienPhanCungRepository linhKienRepository;
    private final DanhSachThietBiPhanMemRepository phanMemRepository;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_ASSET_QR, containerFactory = "assetQrListenerContainerFactory")
    public void handleQrEvent(AssetQrCodeEvent event) {
        if (event == null || event.getAssetId() == null || event.getAssetType() == null) {
            log.warn("[QR-CONSUMER] Nhận được event rỗng hoặc thiếu thông tin định danh: {}", event);
            return;
        }

        log.info("[QR-CONSUMER] Bắt đầu xử lý sinh mã QR: type={}, id={}, code={}",
                event.getAssetType(), event.getAssetId(), event.getAssetCode());

        try {
            // 1. Tạo chuỗi nội dung encode vào QR
            String qrContent = buildQrContent(event);

            // 2. Render ảnh QR PNG 300x300
            byte[] qrBytes = qrCodeService.generateQrBytes(qrContent, 300, 300);

            // 3. Upload lên Cloudflare R2
            String objectKey = buildObjectKey(event);
            String qrUrl = qrStorageService.uploadQrCode(qrBytes, objectKey);

            // 4. Cập nhật URL vào Database
            updateDatabase(event.getAssetType(), event.getAssetId(), qrUrl);

            log.info("[QR-CONSUMER] Xử lý sinh và cập nhật QR thành công: type={}, id={}, url={}",
                    event.getAssetType(), event.getAssetId(), qrUrl);

        } catch (Exception e) {
            log.error("[QR-CONSUMER] Lỗi khi xử lý sinh QR cho type={}, id={}: {}",
                    event.getAssetType(), event.getAssetId(), e.getMessage(), e);
            // Ném lỗi để kích hoạt RetryInterceptor & DLQ
            throw new RuntimeException("Lỗi sinh QR code nền: " + e.getMessage(), e);
        }
    }

    private String buildQrContent(AssetQrCodeEvent event) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", event.getAssetType().name());
            payload.put("id", event.getAssetId());
            payload.put("code", event.getAssetCode() != null ? event.getAssetCode() : "");
            if (event.getTenantId() != null) {
                payload.put("tenantId", event.getTenantId());
            }
            return objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            return String.format("{\"type\":\"%s\",\"id\":%d,\"code\":\"%s\"}",
                    event.getAssetType().name(), event.getAssetId(),
                    event.getAssetCode() != null ? event.getAssetCode() : "");
        }
    }

    private String buildObjectKey(AssetQrCodeEvent event) {
        String typeFolder;
        if (event.getAssetType() == AssetType.HARDWARE_DEVICE) {
            typeFolder = "hardware-device";
        } else if (event.getAssetType() == AssetType.HARDWARE_COMPONENT) {
            typeFolder = "hardware-component";
        } else if (event.getAssetType() == AssetType.SOFTWARE_LICENSE) {
            typeFolder = "software-license";
        } else {
            typeFolder = "general";
        }
        return "qrcodes/" + typeFolder + "/" + event.getAssetId() + ".png";
    }

    private void updateDatabase(AssetType assetType, Long assetId, String qrUrl) {
        if (assetType == AssetType.HARDWARE_DEVICE) {
            thietBiPhanCungRepository.updateQrCodeUrl(assetId, qrUrl);
        } else if (assetType == AssetType.HARDWARE_COMPONENT) {
            linhKienRepository.updateQrCodeUrl(assetId, qrUrl);
        } else if (assetType == AssetType.SOFTWARE_LICENSE) {
            phanMemRepository.updateQrCodeUrl(assetId, qrUrl);
        }
    }
}
