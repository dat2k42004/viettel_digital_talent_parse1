package com.example.backend.modules.asset.service;

import com.example.backend.modules.asset.dto.BackfillResult;
import com.example.backend.modules.asset.event.AssetQrCodeEvent;
import com.example.backend.modules.asset.event.AssetType;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanCung;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanMem;
import com.example.backend.modules.asset.model.LinhKienPhanCung;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanCungRepository;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanMemRepository;
import com.example.backend.modules.asset.repository.LinhKienPhanCungRepository;
import com.example.backend.modules.asset.service.interfaces.AssetQrBackfillService;
import com.example.backend.shared.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssetQrBackfillServiceImpl implements AssetQrBackfillService {

    private final DanhSachThietBiPhanCungRepository thietBiPhanCungRepository;
    private final LinhKienPhanCungRepository linhKienRepository;
    private final DanhSachThietBiPhanMemRepository phanMemRepository;
    @org.springframework.context.annotation.Lazy
    private final RabbitTemplate rabbitTemplate;

    private static final int BATCH_SIZE = 200;

    @Override
    @Transactional(readOnly = true)
    public BackfillResult backfillAllMissingQrCodes() {
        log.info("[QR-BACKFILL] Bắt đầu quét 3 loại tài sản thực thể cấp thấp nhất chưa có QR code để đẩy vào hàng đợi...");
        Map<String, Integer> details = new HashMap<>();

        // 1. Quét DanhSachThietBiPhanCung (Thiết bị phần cứng thực thể)
        int countTbpc = backfillDanhSachThietBiPhanCung();
        details.put(AssetType.HARDWARE_DEVICE.name(), countTbpc);

        // 2. Quét LinhKienPhanCung (Linh kiện phần cứng thực thể)
        int countLkpc = backfillLinhKienPhanCung();
        details.put(AssetType.HARDWARE_COMPONENT.name(), countLkpc);

        // 3. Quét DanhSachThietBiPhanMem (Thiết bị phần mềm / Bản quyền)
        int countTbpm = backfillDanhSachThietBiPhanMem();
        details.put(AssetType.SOFTWARE_LICENSE.name(), countTbpm);

        int total = countTbpc + countLkpc + countTbpm;
        log.info("[QR-BACKFILL] Hoàn thành quét bù QR: tổng cộng {} events đã được đẩy vào RabbitMQ.", total);

        return BackfillResult.builder()
                .totalDispatched(total)
                .detailsByType(details)
                .message(String.format("Đã đẩy thành công %d sự kiện sinh mã QR vào hàng đợi xử lý nền.", total))
                .triggeredAt(LocalDateTime.now())
                .build();
    }

    private int backfillDanhSachThietBiPhanCung() {
        int page = 0;
        int totalDispatched = 0;
        Page<DanhSachThietBiPhanCung> batch;
        do {
            batch = thietBiPhanCungRepository.findAllByQrCodeUrlIsNullAndThoiGianXoaIsNull(PageRequest.of(page, BATCH_SIZE));
            for (DanhSachThietBiPhanCung item : batch.getContent()) {
                AssetQrCodeEvent event = AssetQrCodeEvent.builder()
                        .assetId(item.getId())
                        .assetType(AssetType.HARDWARE_DEVICE)
                        .assetCode(item.getSoSerial())
                        .tenantId(item.getIdDonVi() != null ? item.getIdDonVi().toString() : null)
                        .createdAt(LocalDateTime.now())
                        .build();
                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.EXCHANGE_ASSET_QR,
                        RabbitMQConfig.ROUTING_KEY_ASSET_QR,
                        event);
                totalDispatched++;
            }
            page++;
        } while (batch.hasNext());

        return totalDispatched;
    }

    private int backfillLinhKienPhanCung() {
        int page = 0;
        int totalDispatched = 0;
        Page<LinhKienPhanCung> batch;
        do {
            batch = linhKienRepository.findAllByQrCodeUrlIsNullAndThoiGianXoaIsNull(PageRequest.of(page, BATCH_SIZE));
            for (LinhKienPhanCung item : batch.getContent()) {
                AssetQrCodeEvent event = AssetQrCodeEvent.builder()
                        .assetId(item.getId())
                        .assetType(AssetType.HARDWARE_COMPONENT)
                        .assetCode(item.getSoSerial())
                        .tenantId(item.getIdDonVi() != null ? item.getIdDonVi().toString() : null)
                        .createdAt(LocalDateTime.now())
                        .build();
                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.EXCHANGE_ASSET_QR,
                        RabbitMQConfig.ROUTING_KEY_ASSET_QR,
                        event);
                totalDispatched++;
            }
            page++;
        } while (batch.hasNext());

        return totalDispatched;
    }

    private int backfillDanhSachThietBiPhanMem() {
        int page = 0;
        int totalDispatched = 0;
        Page<DanhSachThietBiPhanMem> batch;
        do {
            batch = phanMemRepository.findAllByQrCodeUrlIsNullAndThoiGianXoaIsNull(PageRequest.of(page, BATCH_SIZE));
            for (DanhSachThietBiPhanMem item : batch.getContent()) {
                AssetQrCodeEvent event = AssetQrCodeEvent.builder()
                        .assetId(item.getId())
                        .assetType(AssetType.SOFTWARE_LICENSE)
                        .assetCode(item.getKeyBanQuyen())
                        .tenantId(item.getIdDonVi() != null ? item.getIdDonVi().toString() : null)
                        .createdAt(LocalDateTime.now())
                        .build();
                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.EXCHANGE_ASSET_QR,
                        RabbitMQConfig.ROUTING_KEY_ASSET_QR,
                        event);
                totalDispatched++;
            }
            page++;
        } while (batch.hasNext());

        return totalDispatched;
    }
}
