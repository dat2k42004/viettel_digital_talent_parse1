package com.example.backend.modules.auth.service;

import com.example.backend.modules.auth.service.interfaces.NguoiDungService;
import com.example.backend.shared.model.TrangThaiCoBanEnum;

import com.example.backend.modules.auth.dto.NguoiDungRequest;
import com.example.backend.modules.auth.dto.NguoiDungResponse;
import com.example.backend.modules.auth.dto.VaiTroResponse;
import com.example.backend.modules.auth.dto.QuyenResponse;
import com.example.backend.modules.auth.dto.NguoiDungTrangThaiRequest;
import com.example.backend.modules.auth.dto.NguoiDungQuyenUpdateRequest;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.model.NguoiDungVaiTro;
import com.example.backend.modules.auth.model.NguoiDungQuyen;
import com.example.backend.modules.auth.model.VaiTro;
import com.example.backend.modules.auth.model.Quyen;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.repository.NguoiDungVaiTroRepository;
import com.example.backend.modules.auth.repository.NguoiDungQuyenRepository;
import com.example.backend.modules.auth.repository.VaiTroRepository;
import com.example.backend.modules.auth.repository.QuyenRepository;
import com.example.backend.modules.tenant.service.interfaces.PhongBanService;
import com.example.backend.modules.tenant.dto.PhongBanResponse;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.cache.annotation.CacheEvict;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.example.backend.modules.auth.model.PhienDangNhap;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.backend.modules.auth.security.NguoiDungUserDetails;
import com.example.backend.modules.auth.repository.PhienDangNhapRepository;
import com.example.backend.modules.auth.security.JwtTokenProvider;
import org.springframework.data.redis.core.RedisTemplate;

@Service
@Slf4j
@RequiredArgsConstructor
public class NguoiDungServiceImpl implements NguoiDungService {

    private final NguoiDungRepository nguoiDungRepository;
    private final NguoiDungVaiTroRepository nguoiDungVaiTroRepository;
    private final NguoiDungQuyenRepository nguoiDungQuyenRepository;
    private final VaiTroRepository vaiTroRepository;
    private final QuyenRepository quyenRepository;
    @Lazy
    private final PasswordEncoder passwordEncoder;
    private final PhienDangNhapRepository phienDangNhapRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final JwtTokenProvider tokenProvider;
    private final PhongBanService phongBanService;
    private final com.example.backend.modules.auth.repository.VaiTroQuyenRepository vaiTroQuyenRepository;
    private final org.springframework.cache.CacheManager cacheManager;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NguoiDungResponse> layDanhSach(
            String search,
            String trangThai,
            Long idPhongBan,
            String chucVu,
            String maNguoiDung,
            int page,
            int size) {
        Long idDonVi = DonViContextHolder.getTenantId();

        Specification<NguoiDung> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Bộ lọc cơ bản: Loại bỏ tài sản/tài khoản đã bị xóa mềm
            predicates.add(cb.isNull(root.get("thoiGianXoa")));

            // Phân quyền cô lập dữ liệu theo Đơn vị (Tenant Isolation)
            boolean laSuperAdmin = com.example.backend.shared.utils.SecurityUtils.laSuperAdmin();
            if (idDonVi != null && !laSuperAdmin) {
                predicates.add(cb.equal(root.get("idDonVi"), idDonVi));
            }

            // SỬA CHUẨN NGHIỆP VỤ: Lọc động theo trạng thái truyền vào thay vì hardcode
            // HOAT_DONG
            if (StringUtils.hasText(trangThai)) {
                try {
                    predicates.add(cb.equal(root.get("trangThai"), TrangThaiCoBanEnum.fromValue(trangThai.trim())));
                } catch (IllegalArgumentException e) {
                    // Bỏ qua hoặc xử lý lỗi nếu chuỗi định dạng không khớp Enum
                }
            }

            // BỔ SUNG: Bộ lọc theo mã phòng ban thuộc tính nguyên thủy trong model
            // NguoiDung
            if (idPhongBan != null) {
                predicates.add(cb.equal(root.get("idPhongBan"), idPhongBan));
            }

            // BỔ SUNG: Bộ lọc theo chức vụ thuộc tính nguyên thủy trong model NguoiDung
            if (StringUtils.hasText(chucVu)) {
                predicates.add(cb.like(cb.lower(root.get("chucVu")), "%" + chucVu.trim().toLowerCase() + "%"));
            }

            // BỔ SUNG: Bộ lọc theo mã định danh người dùng duy nhất
            if (StringUtils.hasText(maNguoiDung)) {
                predicates.add(cb.equal(cb.lower(root.get("maNguoiDung")), maNguoiDung.trim().toLowerCase()));
            }

            // Bộ lọc tìm kiếm nhanh theo từ khóa chuỗi phẳng
            if (search != null && !search.trim().isEmpty()) {
                String likePattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("tenDangNhap")), likePattern),
                        cb.like(cb.lower(root.get("tenNguoiDung")), likePattern),
                        cb.like(cb.lower(root.get("hoNguoiDung")), likePattern),
                        cb.like(cb.lower(root.get("tenDemNguoiDung")), likePattern),
                        cb.like(cb.lower(root.get("email")), likePattern),
                        cb.like(cb.lower(root.get("soDienThoai")), likePattern)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // Thực hiện phân trang và truy vấn dữ liệu từ Repository
        Page<NguoiDung> pageResult = nguoiDungRepository.findAll(spec,
                PageRequest.of(page, size, Sort.by("id").descending()));

        // Giải quyết triệt để lỗi hiệu năng N+1 queries khi map tên phòng ban trên RAM
        List<Long> idPhongBanList = pageResult.getContent().stream()
                .map(NguoiDung::getIdPhongBan)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        final java.util.Map<Long, String> mapPhongBan = idPhongBanList.isEmpty()
                ? new java.util.HashMap<>()
                : phongBanService.layTenPhongBanTheoIds(idPhongBanList);

        Page<NguoiDungResponse> responsePage = pageResult.map(nguoiDung -> {
            String tenPhongBan = nguoiDung.getIdPhongBan() != null ? mapPhongBan.get(nguoiDung.getIdPhongBan()) : null;
            return mapToResponse(nguoiDung, tenPhongBan);
        });
        return PageResponse.from(responsePage);
    }

    @Transactional
    public NguoiDungResponse themMoi(NguoiDungRequest request) {
        kiemTraChotChanDacQuyen(request.getDanhSachIdVaiTro());

        if (nguoiDungRepository.existsByTenDangNhapAndThoiGianXoaIsNull(request.getTenDangNhap())) {
            throw new NghiepVuException("Tên đăng nhập đã tồn tại", 400);
        }
        if (StringUtils.hasText(request.getEmail())
                && nguoiDungRepository.existsByEmailAndThoiGianXoaIsNull(request.getEmail())) {
            throw new NghiepVuException("Email đã được sử dụng", 400);
        }
        if (!StringUtils.hasText(request.getMatKhau())) {
            throw new NghiepVuException("Mật khẩu không được để trống khi tạo mới", 400);
        }

        Long idDonVi = DonViContextHolder.getTenantId();
        validatePhongBan(request.getIdPhongBan(), idDonVi);

        NguoiDung nguoiDung = new NguoiDung();
        nguoiDung.setIdDonVi(idDonVi);
        nguoiDung.setIdPhongBan(request.getIdPhongBan());
        nguoiDung.setMaNguoiDung("ND-" + (idDonVi == null ? 0 : idDonVi) + "-" + System.currentTimeMillis());
        nguoiDung.setTenDangNhap(request.getTenDangNhap());
        nguoiDung.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
        nguoiDung.setHoNguoiDung(request.getHoNguoiDung());
        nguoiDung.setTenDemNguoiDung(request.getTenDemNguoiDung());
        nguoiDung.setTenNguoiDung(request.getTenNguoiDung());
        nguoiDung.setChucVu(request.getChucVu());
        nguoiDung.setEmail(request.getEmail());
        nguoiDung.setSoDienThoai(request.getSoDienThoai());
        nguoiDung.setDanhDaiDienUrl(request.getDanhDaiDienUrl());
        nguoiDung.setTrangThai(TrangThaiCoBanEnum.HOAT_DONG);

        nguoiDung = nguoiDungRepository.save(nguoiDung);

        capNhatVaiTroChoNguoiDung(nguoiDung, request.getDanhSachIdVaiTro());

        return mapToResponse(nguoiDung);
    }

    @Transactional
    @CacheEvict(value = "user_permissions", key = "#id")
    public NguoiDungResponse capNhat(Long id, NguoiDungRequest request) {
        kiemTraChotChanDacQuyen(request.getDanhSachIdVaiTro());
        NguoiDung nguoiDung = kiemTraTonTaiVaQuyen(id);

        if (!nguoiDung.getTenDangNhap().equals(request.getTenDangNhap()) &&
                nguoiDungRepository.existsByTenDangNhapAndThoiGianXoaIsNull(request.getTenDangNhap())) {
            throw new NghiepVuException("Tên đăng nhập đã tồn tại", 400);
        }
        if (StringUtils.hasText(request.getEmail()) && !request.getEmail().equals(nguoiDung.getEmail()) &&
                nguoiDungRepository.existsByEmailAndThoiGianXoaIsNull(request.getEmail())) {
            throw new NghiepVuException("Email đã được sử dụng", 400);
        }

        validatePhongBan(request.getIdPhongBan(), nguoiDung.getIdDonVi());

        nguoiDung.setTenDangNhap(request.getTenDangNhap());
        if (StringUtils.hasText(request.getMatKhau())) {
            nguoiDung.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
        }
        nguoiDung.setHoNguoiDung(request.getHoNguoiDung());
        nguoiDung.setTenDemNguoiDung(request.getTenDemNguoiDung());
        nguoiDung.setTenNguoiDung(request.getTenNguoiDung());
        nguoiDung.setChucVu(request.getChucVu());
        nguoiDung.setEmail(request.getEmail());
        nguoiDung.setSoDienThoai(request.getSoDienThoai());
        nguoiDung.setDanhDaiDienUrl(request.getDanhDaiDienUrl());
        nguoiDung.setIdPhongBan(request.getIdPhongBan());

        nguoiDung = nguoiDungRepository.save(nguoiDung);

        capNhatVaiTroChoNguoiDung(nguoiDung, request.getDanhSachIdVaiTro());

        return mapToResponse(nguoiDung);
    }

    @Transactional
    @CacheEvict(value = "user_permissions", key = "#id")
    public void xoaMem(Long id) {
        NguoiDung nguoiDung = kiemTraTonTaiVaQuyen(id);
        nguoiDung.setThoiGianXoa(LocalDateTime.now());
        nguoiDung.setLyDoXoa("Xóa tài khoản");
        nguoiDungRepository.save(nguoiDung);
    }

    private void capNhatVaiTroChoNguoiDung(NguoiDung nguoiDung, List<Long> idVaiTroList) {
        nguoiDungVaiTroRepository.deleteByNguoiDungId(nguoiDung.getId());
        if (idVaiTroList != null && !idVaiTroList.isEmpty()) {
            List<VaiTro> vaiTroList = vaiTroRepository.findAllByIdInAndThoiGianXoaIsNull(idVaiTroList);
            List<NguoiDungVaiTro> list = vaiTroList.stream().map(v -> {
                NguoiDungVaiTro nv = new NguoiDungVaiTro();
                nv.setNguoiDung(nguoiDung);
                nv.setVaiTro(v);
                return nv;
            }).collect(Collectors.toList());
            nguoiDungVaiTroRepository.saveAll(list);
        }
        dongBoQuyenNguoiDung(nguoiDung);
    }

    private void dongBoQuyenNguoiDung(NguoiDung nguoiDung) {
        nguoiDungQuyenRepository.deleteByNguoiDungId(nguoiDung.getId());
        List<NguoiDungVaiTro> userRoles = nguoiDungVaiTroRepository.findByNguoiDungId(nguoiDung.getId());

        // Evict user permissions cache
        if (cacheManager != null && cacheManager.getCache("user_permissions") != null) {
            cacheManager.getCache("user_permissions").evict(nguoiDung.getId());
        }

        if (userRoles.isEmpty()) {
            return;
        }

        List<Long> roleIds = userRoles.stream().map(ur -> ur.getVaiTro().getId()).collect(Collectors.toList());
        List<com.example.backend.modules.auth.model.VaiTroQuyen> rolePermissions = vaiTroQuyenRepository
                .findByVaiTroIdIn(roleIds);

        List<Quyen> uniquePermissions = rolePermissions.stream()
                .map(com.example.backend.modules.auth.model.VaiTroQuyen::getQuyen)
                .filter(q -> q.getThoiGianXoa() == null && q.getTrangThai() == TrangThaiCoBanEnum.HOAT_DONG)
                .distinct()
                .collect(Collectors.toList());

        List<NguoiDungQuyen> userPerms = uniquePermissions.stream().map(q -> {
            NguoiDungQuyen nq = new NguoiDungQuyen();
            nq.setNguoiDung(nguoiDung);
            nq.setQuyen(q);
            return nq;
        }).collect(Collectors.toList());

        nguoiDungQuyenRepository.saveAll(userPerms);
    }

    private NguoiDung kiemTraTonTaiVaQuyen(Long id) {
        NguoiDung nguoiDung = nguoiDungRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy người dùng", 404));
        Long idDonVi = DonViContextHolder.getTenantId();
        if (idDonVi != null && !idDonVi.equals(nguoiDung.getIdDonVi())) {
            throw new NghiepVuException("Bạn không có quyền thao tác trên người dùng này", 403);
        }
        return nguoiDung;
    }

    private NguoiDungResponse mapToResponse(NguoiDung nguoiDung) {
        String tenPhongBan = null;
        if (nguoiDung.getIdPhongBan() != null) {
            PhongBanResponse pb = phongBanService.layTheoId(nguoiDung.getIdPhongBan());
            if (pb != null) {
                tenPhongBan = pb.getTenPhongBan();
            }
        }
        return mapToResponse(nguoiDung, tenPhongBan);
    }

    private NguoiDungResponse mapToResponse(NguoiDung nguoiDung, String tenPhongBan) {
        List<VaiTroResponse> danhSachVaiTro = nguoiDungVaiTroRepository.findByNguoiDungId(nguoiDung.getId()).stream()
                .map(nv -> VaiTroResponse.builder()
                        .id(nv.getVaiTro().getId())
                        .maVaiTro(nv.getVaiTro().getMaVaiTro())
                        .tenVaiTro(nv.getVaiTro().getTenVaiTro())
                        .build())
                .collect(Collectors.toList());

        List<QuyenResponse> danhSachQuyen = nguoiDungQuyenRepository.findByNguoiDungId(nguoiDung.getId()).stream()
                .map(nq -> QuyenResponse.builder()
                        .id(nq.getQuyen().getId())
                        .maQuyen(nq.getQuyen().getMaQuyen())
                        .tenQuyen(nq.getQuyen().getTenQuyen())
                        .idQuyenCha(nq.getQuyen().getIdQuyenCha())
                        .loaiQuyen(nq.getQuyen().getLoaiQuyen())
                        .build())
                .collect(Collectors.toList());

        List<String> danhSachQuyenPhanGiai = quyenRepository.findAllByNguoiDungId(nguoiDung.getId()).stream()
                .map(Quyen::getMaQuyen)
                .collect(Collectors.toList());

        return NguoiDungResponse.builder()
                .id(nguoiDung.getId())
                .idDonVi(nguoiDung.getIdDonVi())
                .idPhongBan(nguoiDung.getIdPhongBan())
                .tenPhongBan(tenPhongBan)
                .maNguoiDung(nguoiDung.getMaNguoiDung())
                .tenDangNhap(nguoiDung.getTenDangNhap())
                .hoNguoiDung(nguoiDung.getHoNguoiDung())
                .tenDemNguoiDung(nguoiDung.getTenDemNguoiDung())
                .tenNguoiDung(nguoiDung.getTenNguoiDung())
                .chucVu(nguoiDung.getChucVu())
                .email(nguoiDung.getEmail())
                .soDienThoai(nguoiDung.getSoDienThoai())
                .danhDaiDienUrl(nguoiDung.getDanhDaiDienUrl())
                .trangThai(nguoiDung.getTrangThai() != null ? nguoiDung.getTrangThai().getValue() : null)
                .danhSachVaiTro(danhSachVaiTro)
                .danhSachQuyen(danhSachQuyen)
                .danhSachQuyenPhanGiai(danhSachQuyenPhanGiai)
                .build();
    }

    private void validatePhongBan(Long idPhongBan, Long idDonVi) {
        phongBanService.validatePhongBan(idPhongBan, idDonVi);
    }

    @Override
    @Transactional
    @CacheEvict(value = "user_permissions", key = "#id")
    public void capNhatTrangThai(Long id, NguoiDungTrangThaiRequest request) {
        NguoiDung nguoiDung = kiemTraTonTaiVaQuyen(id);
        String trangThai = request.getTrangThai();
        try {
            nguoiDung.setTrangThai(TrangThaiCoBanEnum.fromValue(trangThai));
        } catch (IllegalArgumentException e) {
            throw new NghiepVuException("Trạng thái không hợp lệ. Chỉ chấp nhận HOAT_DONG hoặc KHOA", 400);
        }
        nguoiDungRepository.save(nguoiDung);
    }

    @Override
    @Transactional
    @CacheEvict(value = "user_permissions", key = "#id")
    public void capNhatQuyenTrucTiep(Long id, NguoiDungQuyenUpdateRequest request) {
        NguoiDung nguoiDung = kiemTraTonTaiVaQuyen(id);
        capNhatQuyenTrucTiepChoNguoiDung(nguoiDung, request.getDanhSachIdQuyen());
    }

    private void capNhatQuyenTrucTiepChoNguoiDung(NguoiDung nguoiDung, List<Long> idQuyenList) {
        nguoiDungQuyenRepository.deleteByNguoiDungId(nguoiDung.getId());
        if (idQuyenList != null && !idQuyenList.isEmpty()) {
            List<Quyen> quyenList = quyenRepository.findAllByIdInAndThoiGianXoaIsNull(idQuyenList);
            List<NguoiDungQuyen> list = quyenList.stream().map(q -> {
                NguoiDungQuyen nq = new NguoiDungQuyen();
                nq.setNguoiDung(nguoiDung);
                nq.setQuyen(q);
                nq.setIdDonVi(nguoiDung.getIdDonVi());
                nq.setTenQuyen(q.getTenQuyen());
                nq.setLoaiQuyen(q.getLoaiQuyen());
                nq.setDuongDan(q.getDuongDan());
                nq.setPhuongThucHttp(q.getPhuongThucHttp());
                nq.setThoiGian(LocalDateTime.now());
                return nq;
            }).collect(Collectors.toList());
            nguoiDungQuyenRepository.saveAll(list);
        }
    }

    @Override
    public NguoiDungResponse layTheoId(Long id) {
        NguoiDung nguoiDung = nguoiDungRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy người dùng hoặc người dùng đã bị xóa", 404));

        if (nguoiDung.getTrangThai() != TrangThaiCoBanEnum.HOAT_DONG) {
            throw new NghiepVuException("Tài khoản người dùng hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }

        Long tenantId = DonViContextHolder.getTenantId();
        boolean laSuperAdmin = com.example.backend.shared.utils.SecurityUtils.laSuperAdmin();
        if (tenantId != null && !tenantId.equals(nguoiDung.getIdDonVi()) && !laSuperAdmin) {
            throw new NghiepVuException("Bạn không có quyền xem thông tin người dùng thuộc đơn vị khác", 403);
        }

        return mapToResponse(nguoiDung);
    }

    @Override
    @Cacheable(value = "user_permissions", key = "#userId", unless = "#result == null")
    public List<String> resolveAndCacheUserPermissions(Long userId) {
        return quyenRepository.findAllByNguoiDungId(userId).stream()
                .map(Quyen::getMaQuyen)
                .collect(Collectors.toList());
    }

    private void kiemTraChotChanDacQuyen(List<Long> idVaiTroList) {
        if (idVaiTroList == null || idVaiTroList.isEmpty()) {
            return;
        }

        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (authentication != null && authentication
                .getPrincipal() instanceof com.example.backend.modules.auth.security.NguoiDungUserDetails userDetails) {
            Long currentUserIdDonVi = userDetails.getNguoiDung().getIdDonVi();

            // Nếu Current User là "Admin cấp cơ sở" (idDonVi != null)
            if (currentUserIdDonVi != null) {
                // Kiểm tra xem trong các vai trò được gán có vai trò nào là của Super Admin
                // (idDonVi == null) không
                List<VaiTro> vaiTroList = vaiTroRepository.findAllByIdInAndThoiGianXoaIsNull(idVaiTroList);
                for (VaiTro vaiTro : vaiTroList) {
                    if (vaiTro.getIdDonVi() == null) {
                        throw new NghiepVuException("Bạn không có quyền cấp phát vai trò cấp cao hệ thống", 403);
                    }
                }
            }
        }
    }

    @Override
    @Transactional
    public void thuHoiPhien(Long id) {
        NguoiDung targetUser = nguoiDungRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy người dùng", 404));

        Long currentUserIdDonVi = DonViContextHolder.getTenantId();
        // Kiểm tra cô lập dữ liệu (Multi-tenant check)
        if (currentUserIdDonVi != null && !currentUserIdDonVi.equals(targetUser.getIdDonVi())) {
            throw new NghiepVuException("403 Forbidden - Bạn không có quyền thao tác trên người dùng của đơn vị khác",
                    403);
        }

        // 1. Tìm toàn bộ danh sách các phiên đang hoạt động của userId này
        List<PhienDangNhap> activeSessions = phienDangNhapRepository
                .findByNguoiDungIdAndTrangThaiAndThoiGianXoaIsNull(id, "HOAT_DONG");

        for (PhienDangNhap phien : activeSessions) {
            // Chuyển trạng thái sang EXPIRED và đánh dấu xóa
            phien.setTrangThai("EXPIRED");
            phien.setThoiGianXoa(LocalDateTime.now());
            phien.setLyDoXoa("Bị cưỡng chế đăng xuất bởi quản trị viên");
            phienDangNhapRepository.save(phien);

            // 2. Đẩy accessToken vào blacklist trên Redis
            String accessToken = phien.getTokenTruyCap();
            if (accessToken != null && tokenProvider.validateToken(accessToken)) {
                try {
                    long expirationTime = tokenProvider.getExpirationTimeFromToken(accessToken);
                    if (expirationTime > 0) {
                        redisTemplate.opsForValue().set(
                                "jwt_blacklist:" + accessToken,
                                "blacklisted",
                                java.time.Duration.ofMillis(expirationTime));
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi thêm access token của user ID {} vào blacklist: {}", id, e.getMessage());
                }
            }
        }

        log.info("Đã cưỡng chế đăng xuất thành công và vô hiệu hóa {} phiên làm việc của user ID: {}",
                activeSessions.size(), id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.example.backend.modules.asset.dto.SelectOption> laySelectOptions(Long idPhongBan, String keyword) {
        Long idDonVi = DonViContextHolder.getTenantId();

        Specification<NguoiDung> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            predicates.add(cb.equal(root.get("trangThai"), TrangThaiCoBanEnum.HOAT_DONG));

            if (idPhongBan != null) {
                predicates.add(cb.equal(root.get("idPhongBan"), idPhongBan));
            } else if (idDonVi != null && !com.example.backend.shared.utils.SecurityUtils.laSuperAdmin()) {
                predicates.add(cb.equal(root.get("idDonVi"), idDonVi));
            }

            if (org.springframework.util.StringUtils.hasText(keyword)) {
                String likePattern = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("tenDangNhap")), likePattern),
                        cb.like(cb.lower(root.get("tenNguoiDung")), likePattern),
                        cb.like(cb.lower(root.get("hoNguoiDung")), likePattern),
                        cb.like(cb.lower(root.get("tenDemNguoiDung")), likePattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return nguoiDungRepository.findAll(spec).stream()
                .limit(50)
                .map(nd -> {
                    StringBuilder sb = new StringBuilder();
                    if (nd.getHoNguoiDung() != null)
                        sb.append(nd.getHoNguoiDung().trim()).append(" ");
                    if (nd.getTenDemNguoiDung() != null)
                        sb.append(nd.getTenDemNguoiDung().trim()).append(" ");
                    if (nd.getTenNguoiDung() != null)
                        sb.append(nd.getTenNguoiDung().trim());
                    String name = sb.toString().trim();
                    if (name.isEmpty()) {
                        name = nd.getTenDangNhap();
                    }
                    return com.example.backend.modules.asset.dto.SelectOption.builder()
                            .id(nd.getId())
                            .ten(name)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @jakarta.annotation.PostConstruct
    @Transactional
    public void initCleanup() {
        try {
            log.info("Bắt đầu đồng bộ làm sạch quyền cho toàn bộ người dùng hệ thống...");
            List<NguoiDung> users = nguoiDungRepository.findAll();
            for (NguoiDung user : users) {
                dongBoQuyenNguoiDung(user);
            }
            log.info("Đã đồng bộ làm sạch quyền thành công cho {} người dùng.", users.size());
        } catch (Exception e) {
            log.error("Lỗi khi chạy dọn dẹp đồng bộ quyền người dùng lúc khởi động: {}", e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NguoiDungResponse> layAdminDonVi(Long idDonVi) {
        return nguoiDungRepository.findByIdDonViAndThoiGianXoaIsNull(idDonVi).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<Long, String> layTenNguoiDungTheoIds(java.util.Collection<Long> ids) {
        java.util.Map<Long, String> map = new java.util.HashMap<>();
        if (ids == null || ids.isEmpty()) {
            return map;
        }
        nguoiDungRepository.findAllByIdInAndThoiGianXoaIsNull(new java.util.HashSet<>(ids))
                .forEach(u -> map.put(u.getId(), layHoTen(u)));
        return map;
    }

    @Override
    @Transactional(readOnly = true)
    public String layTenNguoiDungTheoId(Long id) {
        if (id == null)
            return null;
        return nguoiDungRepository.findByIdAndThoiGianXoaIsNull(id)
                .map(this::layHoTen)
                .orElse(null);
    }

    private String layHoTen(NguoiDung nd) {
        if (nd == null)
            return "";
        StringBuilder sb = new StringBuilder();
        if (nd.getHoNguoiDung() != null)
            sb.append(nd.getHoNguoiDung().trim()).append(" ");
        if (nd.getTenDemNguoiDung() != null)
            sb.append(nd.getTenDemNguoiDung().trim()).append(" ");
        if (nd.getTenNguoiDung() != null)
            sb.append(nd.getTenNguoiDung().trim());
        String name = sb.toString().trim();
        return name.isEmpty() ? nd.getTenDangNhap() : name;
    }

    @Override
    public Long layIdNguoiDungHienTai() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof NguoiDungUserDetails userDetails) {
            return userDetails.getNguoiDung().getId();
        }
        throw new NghiepVuException("Không tìm thấy thông tin người dùng từ phiên làm việc", 401);
    }
}
