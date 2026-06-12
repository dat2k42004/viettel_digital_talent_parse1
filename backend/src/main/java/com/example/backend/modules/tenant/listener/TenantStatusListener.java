package com.example.backend.modules.tenant.listener;

import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.repository.VaiTroRepository;
import com.example.backend.modules.tenant.repository.PhongBanRepository;
import com.example.backend.modules.tenant.repository.ViTriRepository;
import com.example.backend.shared.dto.TenantStatusEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class TenantStatusListener {

    private final NguoiDungRepository nguoiDungRepository;
    private final PhongBanRepository phongBanRepository;
    private final ViTriRepository viTriRepository;
    private final VaiTroRepository vaiTroRepository;

    @RabbitListener(queues = "tenant.status.queue")
    @Transactional
    public void processTenantStatusUpdate(TenantStatusEvent event) {
        Long idDonVi = event.getIdDonVi();
        String trangThai = event.getTrangThai();
        log.info("Nhận sự kiện cập nhật trạng thái đơn vị ID: {} -> {}", idDonVi, trangThai);

        try {
            nguoiDungRepository.updateTrangThaiByIdDonVi(idDonVi, trangThai);
            phongBanRepository.updateTrangThaiByDonViId(idDonVi, trangThai);
            viTriRepository.updateTrangThaiByDonViId(idDonVi, trangThai);
            vaiTroRepository.updateTrangThaiByIdDonVi(idDonVi, trangThai);

            log.info("Hoàn tất cascade cập nhật trạng thái cho các thực thể thuộc đơn vị ID: {}", idDonVi);
        } catch (Exception e) {
            log.error("Lỗi khi cascade cập nhật trạng thái cho đơn vị ID = {}: {}", idDonVi, e.getMessage(), e);
            throw e;
        }
    }
}
