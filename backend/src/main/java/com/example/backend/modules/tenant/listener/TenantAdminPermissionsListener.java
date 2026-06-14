package com.example.backend.modules.tenant.listener;

import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.model.NguoiDungQuyen;
import com.example.backend.modules.auth.model.Quyen;
import com.example.backend.modules.auth.repository.NguoiDungQuyenRepository;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.repository.QuyenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class TenantAdminPermissionsListener {

    private final NguoiDungRepository nguoiDungRepository;
    private final QuyenRepository quyenRepository;
    private final NguoiDungQuyenRepository nguoiDungQuyenRepository;

    @RabbitListener(queues = "tenant.init-admin-permissions.queue")
    @Transactional
    public void processTenantAdminPermissions(Long adminUserId) {
        log.info("Nhận sự kiện khởi tạo quyền trực tiếp cho Admin User ID: {}", adminUserId);
        try {
            NguoiDung admin = nguoiDungRepository.findByIdAndThoiGianXoaIsNull(adminUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng Admin với ID: " + adminUserId));

            List<Quyen> corporatePermissions = quyenRepository.findByLoaiQuyenAndTrangThaiAndThoiGianXoaIsNull("QUYEN_DON_VI", "HOAT_DONG");
            
            nguoiDungQuyenRepository.deleteByNguoiDungId(adminUserId);

            List<NguoiDungQuyen> list = corporatePermissions.stream().map(q -> {
                NguoiDungQuyen nq = new NguoiDungQuyen();
                nq.setNguoiDung(admin);
                nq.setQuyen(q);
                nq.setIdDonVi(admin.getIdDonVi());
                nq.setTenQuyen(q.getTenQuyen());
                nq.setLoaiQuyen(q.getLoaiQuyen());
                nq.setDuongDan(q.getDuongDan());
                nq.setPhuongThucHttp(q.getPhuongThucHttp());
                nq.setThoiGian(LocalDateTime.now());
                return nq;
            }).collect(Collectors.toList());

            if (!list.isEmpty()) {
                nguoiDungQuyenRepository.saveAll(list);
                log.info("Khởi tạo thành công {} quyền trực tiếp cho Admin User ID: {}", list.size(), adminUserId);
            }
        } catch (Exception e) {
            log.error("Lỗi khởi tạo quyền trực tiếp cho Admin User ID = {}: {}", adminUserId, e.getMessage(), e);
            throw e;
        }
    }
}
