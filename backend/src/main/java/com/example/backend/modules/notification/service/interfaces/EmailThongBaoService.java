package com.example.backend.modules.notification.service.interfaces;

public interface EmailThongBaoService {
     void nhacNhoChungTuTonDong();
     void canhBaoHetHanTaiSan();
     void guiEmailYeuCauKiemKe(
             String emailNhan,
             String tenTruongPhong,
             String tenPhongBan,
             String tenDotKiemKe,
             String maDotKiemKe,
             java.time.LocalDate thoiGianBatDauDuKien,
             java.time.LocalDate thoiGianKetThucDuKien
     );
}
