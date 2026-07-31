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

            Optional<NguoiDung> adminOpt = nguoiDungRepository.findByTenDangNhap("admin");
            NguoiDung admin;

            if (adminOpt.isPresent()) {
                admin = adminOpt.get();
                log.info("Tìm thấy tài khoản admin (ID: {}). Tiến hành cập nhật lại mật khẩu admin@123 chuẩn BCrypt...", admin.getId());
            } else {
                admin = new NguoiDung();
                admin.setTenDangNhap("admin");
                admin.setMaNguoiDung("NV-00000");
                admin.setHoNguoiDung("Hệ Thống");
                admin.setTenDemNguoiDung("Quản Trị");
                admin.setTenNguoiDung("Tối Cao");
                admin.setEmail("superadmin@itam.com");
                admin.setSoDienThoai("0123456789");
                log.info("Tạo mới tài khoản admin với mật khẩu admin@123...");
            }

            // Mã hóa mật khẩu "admin@123" trực tiếp bằng Bean PasswordEncoder của Spring Boot
            admin.setMatKhau(passwordEncoder.encode("admin@123"));
            admin.setTrangThai(TrangThaiCoBanEnum.HOAT_DONG);
            admin.setThoiGianXoa(null);
            admin = nguoiDungRepository.save(admin);

            // Đảm bảo gán vai trò ROLE_SUPER_ADMIN cho tài khoản admin
            Optional<VaiTro> roleOpt = vaiTroRepository.findByMaVaiTroAndIdDonViIsNullAndThoiGianXoaIsNull("ROLE_SUPER_ADMIN");
            if (roleOpt.isPresent()) {
                VaiTro superAdminRole = roleOpt.get();
                boolean hasRole = nguoiDungVaiTroRepository
                        .findByNguoiDungId(admin.getId()).stream()
                        .anyMatch(nv -> nv.getVaiTro() != null && superAdminRole.getId().equals(nv.getVaiTro().getId()));

                if (!hasRole) {
                    NguoiDungVaiTro userRole = new NguoiDungVaiTro();
                    userRole.setNguoiDung(admin);
                    userRole.setVaiTro(superAdminRole);
                    userRole.setThoiGianBatDau(LocalDateTime.now());
                    userRole.setGhiChuGan("Kích hoạt đặc quyền quản trị tối cao toàn diện hệ thống");
                    nguoiDungVaiTroRepository.save(userRole);
                    log.info("Đã gán vai trò ROLE_SUPER_ADMIN cho tài khoản admin.");
                }
            }

            log.info("Tài khoản admin đã được đồng bộ thành công! Mật khẩu đăng nhập: admin@123");
        } catch (Exception e) {
            log.error("Lỗi khi khởi tạo tài khoản admin: {}", e.getMessage(), e);
        }
    }
}
