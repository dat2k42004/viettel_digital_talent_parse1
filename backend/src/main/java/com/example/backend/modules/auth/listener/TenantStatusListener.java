package com.example.backend.modules.auth.listener;

import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.repository.VaiTroRepository;
import com.example.backend.shared.dto.TenantStatusEvent;
import com.example.backend.shared.model.TrangThaiCoBanEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.modules.auth.repository.MaXacThucOTPRepository;
import com.example.backend.shared.dto.DonViXoaEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class TenantStatusListener {

    private final NguoiDungRepository nguoiDungRepository;
    private final VaiTroRepository vaiTroRepository;
    private final MaXacThucOTPRepository maXacThucOTPRepository;

    @RabbitListener(queues = "tenant.status.queue")
    @Transactional
    public void processTenantStatusUpdate(TenantStatusEvent event) {
        Long idDonVi = event.getIdDonVi();
        String trangThai = event.getTrangThai();
        log.info("Nhận sự kiện cập nhật trạng thái đơn vị ID: {} -> {} (Phân hệ Auth)", idDonVi, trangThai);

        try {
            TrangThaiCoBanEnum statusEnum = TrangThaiCoBanEnum.fromValue(trangThai);
            nguoiDungRepository.updateTrangThaiByIdDonVi(idDonVi, statusEnum);
            vaiTroRepository.updateTrangThaiByIdDonVi(idDonVi, statusEnum);

            log.info("Hoàn tất cascade cập nhật trạng thái cho các thực thể Auth thuộc đơn vị ID: {}", idDonVi);
        } catch (Exception e) {
            log.error("Lỗi khi cascade cập nhật trạng thái các thực thể Auth cho đơn vị ID = {}: {}", idDonVi, e.getMessage(), e);
            throw e;
        }
    }

    @org.springframework.context.event.EventListener
    @Transactional
    public void onDonViXoa(DonViXoaEvent event) {
        Long idDonVi = event.getIdDonVi();
        java.time.LocalDateTime now = event.getThoiGianXoa();
        String lyDo = event.getLyDoXoa();
        log.info("Nhận sự kiện xóa đơn vị ID: {} (Phân hệ Auth)", idDonVi);

        try {
            nguoiDungRepository.softDeleteByIdDonVi(idDonVi, now, lyDo);
            vaiTroRepository.softDeleteByIdDonVi(idDonVi, now, lyDo);
            maXacThucOTPRepository.softDeleteByIdDonVi(idDonVi, now, lyDo);
            log.info("Hoàn tất cascade xóa mềm các thực thể Auth thuộc đơn vị ID: {}", idDonVi);
        } catch (Exception e) {
            log.error("Lỗi khi cascade xóa các thực thể Auth cho đơn vị ID = {}: {}", idDonVi, e.getMessage(), e);
            throw e;
        }
    }
}
