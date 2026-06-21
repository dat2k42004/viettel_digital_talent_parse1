package com.example.backend.modules.tenant.listener;

import com.example.backend.modules.tenant.model.CauHinhDonVi;
import com.example.backend.shared.model.TrangThaiCoBanEnum;
import com.example.backend.modules.tenant.model.DanhMucCauHinh;
import com.example.backend.modules.tenant.model.DonVi;
import com.example.backend.modules.tenant.repository.CauHinhDonViRepository;
import com.example.backend.modules.tenant.repository.DanhMucCauHinhRepository;
import com.example.backend.modules.tenant.repository.DonViRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class TenantInitConfigListener {

    private final DonViRepository donViRepository;
    private final DanhMucCauHinhRepository danhMucCauHinhRepository;
    private final CauHinhDonViRepository cauHinhDonViRepository;

    @RabbitListener(queues = "tenant.init-config.queue")
    @Transactional
    public void processTenantInitConfig(Long idDonVi) {
        log.info("Nhận sự kiện khởi tạo cấu hình mặc định cho đơn vị ID: {}", idDonVi);
        try {
            DonVi donVi = donViRepository.findByIdAndThoiGianXoaIsNull(idDonVi)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn vị hoạt động với ID: " + idDonVi));

            List<DanhMucCauHinh> catalogList = danhMucCauHinhRepository.findByThoiGianXoaIsNull();
            
            List<CauHinhDonVi> newConfigs = catalogList.stream()
                    .filter(cat -> cat.getTrangThai() == TrangThaiCoBanEnum.HOAT_DONG)
                    .filter(cat -> !cauHinhDonViRepository.existsByDanhMucCauHinhIdAndDonViIdAndThoiGianXoaIsNull(cat.getId(), idDonVi))
                    .map(cat -> {
                        CauHinhDonVi ch = new CauHinhDonVi();
                        ch.setDonVi(donVi);
                        ch.setDanhMucCauHinh(cat);
                        ch.setGiaTriCauHinh(cat.getGiaTriMacDinh());
                        return ch;
                    })
                    .collect(Collectors.toList());

            if (!newConfigs.isEmpty()) {
                cauHinhDonViRepository.saveAll(newConfigs);
                log.info("Khởi tạo thành công {} cấu hình mặc định cho đơn vị ID: {}", newConfigs.size(), idDonVi);
            } else {
                log.info("Đơn vị ID: {} đã có đầy đủ cấu hình mặc định.", idDonVi);
            }
        } catch (Exception e) {
            log.error("Lỗi khởi tạo cấu hình mặc định cho đơn vị ID = {}: {}", idDonVi, e.getMessage(), e);
            throw e;
        }
    }
}
