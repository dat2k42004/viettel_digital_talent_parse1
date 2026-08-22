package com.example.backend.shared.config;

import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.model.NguoiDungVaiTro;
import com.example.backend.modules.auth.model.VaiTro;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.repository.NguoiDungVaiTroRepository;
import com.example.backend.modules.auth.repository.VaiTroRepository;
import com.example.backend.shared.model.TrangThaiCoBanEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final NguoiDungRepository nguoiDungRepository;
    private final VaiTroRepository vaiTroRepository;
    private final NguoiDungVaiTroRepository nguoiDungVaiTroRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            log.info("Khởi tạo / Kiểm tra tài khoản Super Admin (username: admin)...");

            List<NguoiDung> adminList = nguoiDungRepository.findAllByTenDangNhap("admin");
            if (adminList.isEmpty()) {
                NguoiDung newAdmin = new NguoiDung();
                newAdmin.setTenDangNhap("admin");
                newAdmin.setMaNguoiDung("NV-00000");
                newAdmin.setHoNguoiDung("Hệ Thống");
                newAdmin.setTenDemNguoiDung("Quản Trị");
                newAdmin.setTenNguoiDung("Tối Cao");
                newAdmin.setEmail("superadmin@itam.com");
                newAdmin.setSoDienThoai("0123456789");
                adminList.add(newAdmin);
                log.info("Tạo mới tài khoản admin với mật khẩu admin@123...");
            } else {
                log.info("Tìm thấy {} bản ghi tài khoản admin. Tiến hành đồng bộ mật khẩu admin@123 chuẩn BCrypt...", adminList.size());
            }

            for (NguoiDung admin : adminList) {
                // Mã hóa mật khẩu "admin@123" trực tiếp bằng Bean PasswordEncoder của Spring Boot
                admin.setMatKhau(passwordEncoder.encode("admin@123"));
                admin.setTrangThai(TrangThaiCoBanEnum.HOAT_DONG);
                admin.setThoiGianXoa(null);
                NguoiDung savedAdmin = nguoiDungRepository.save(admin);

                // Đảm bảo gán vai trò ROLE_SUPER_ADMIN cho tài khoản admin
                Optional<VaiTro> roleOpt = vaiTroRepository.findByMaVaiTroAndIdDonViIsNullAndThoiGianXoaIsNull("ROLE_SUPER_ADMIN");
                if (roleOpt.isPresent()) {
                    VaiTro superAdminRole = roleOpt.get();
                    boolean hasRole = nguoiDungVaiTroRepository
                            .findByNguoiDungId(savedAdmin.getId()).stream()
                            .anyMatch(nv -> nv.getVaiTro() != null && superAdminRole.getId().equals(nv.getVaiTro().getId()));

                    if (!hasRole) {
                        NguoiDungVaiTro userRole = new NguoiDungVaiTro();
                        userRole.setNguoiDung(savedAdmin);
                        userRole.setVaiTro(superAdminRole);
                        userRole.setThoiGianBatDau(LocalDateTime.now());
                        userRole.setGhiChuGan("Kích hoạt đặc quyền quản trị tối cao toàn diện hệ thống");
                        nguoiDungVaiTroRepository.save(userRole);
                        log.info("Đã gán vai trò ROLE_SUPER_ADMIN cho tài khoản admin (ID: {}).", savedAdmin.getId());
                    }
                }
            }

            log.info("Tài khoản admin đã được đồng bộ thành công! Mật khẩu đăng nhập: admin@123");
        } catch (Exception e) {
            log.error("Lỗi khi khởi tạo tài khoản admin: {}", e.getMessage(), e);
        }
    }
}
