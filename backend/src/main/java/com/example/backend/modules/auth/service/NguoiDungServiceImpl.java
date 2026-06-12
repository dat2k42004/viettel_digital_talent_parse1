package com.example.backend.modules.auth.service;

import com.example.backend.modules.auth.service.interfaces.NguoiDungService;

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
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
public class NguoiDungServiceImpl implements NguoiDungService {

    private final NguoiDungRepository nguoiDungRepository;
    private final NguoiDungVaiTroRepository nguoiDungVaiTroRepository;
    private final NguoiDungQuyenRepository nguoiDungQuyenRepository;
    private final VaiTroRepository vaiTroRepository;
    private final QuyenRepository quyenRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public PageResponse<NguoiDungResponse> layDanhSach(String search, String trangThai, int page, int size) {
        Long idDonVi = DonViContextHolder.getTenantId();

        Specification<NguoiDung> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            predicates.add(cb.equal(root.get("trangThai"), "HOAT_DONG"));

            // Phân quyền theo Đơn vị (Tenant) - Super Admin xem toàn bộ, Tenant Admin xem theo Đơn vị
            if (idDonVi != null) {
                predicates.add(cb.equal(root.get("idDonVi"), idDonVi));
            }

            if (search != null && !search.trim().isEmpty()) {
                String likePattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("tenDangNhap")), likePattern),
                        cb.like(cb.lower(root.get("tenNguoiDung")), likePattern),
                        cb.like(cb.lower(root.get("hoNguoiDung")), likePattern),
                        cb.like(cb.lower(root.get("tenDemNguoiDung")), likePattern),
                        cb.like(cb.lower(root.get("email")), likePattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<NguoiDung> pageResult = nguoiDungRepository.findAll(spec, PageRequest.of(page, size, Sort.by("id").descending()));
        Page<NguoiDungResponse> responsePage = pageResult.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Transactional
    public NguoiDungResponse themMoi(NguoiDungRequest request) {
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

        NguoiDung nguoiDung = new NguoiDung();
        nguoiDung.setIdDonVi(idDonVi);
        nguoiDung.setTenDangNhap(request.getTenDangNhap());
        nguoiDung.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
        nguoiDung.setHoNguoiDung(request.getHoNguoiDung());
        nguoiDung.setTenDemNguoiDung(request.getTenDemNguoiDung());
        nguoiDung.setTenNguoiDung(request.getTenNguoiDung());
        nguoiDung.setChucVu(request.getChucVu());
        nguoiDung.setEmail(request.getEmail());
        nguoiDung.setSoDienThoai(request.getSoDienThoai());
        nguoiDung.setDanhDaiDienUrl(request.getDanhDaiDienUrl());
        nguoiDung.setTrangThai(StringUtils.hasText(request.getTrangThai()) ? request.getTrangThai() : "HOAT_DONG");

        nguoiDung = nguoiDungRepository.save(nguoiDung);

        capNhatVaiTroChoNguoiDung(nguoiDung, request.getDanhSachIdVaiTro());
        capNhatQuyenTrucTiepChoNguoiDung(nguoiDung, request.getDanhSachIdQuyen());

        return mapToResponse(nguoiDung);
    }

    @Transactional
    public NguoiDungResponse capNhat(Long id, NguoiDungRequest request) {
        NguoiDung nguoiDung = kiemTraTonTaiVaQuyen(id);

        if (!nguoiDung.getTenDangNhap().equals(request.getTenDangNhap()) &&
                nguoiDungRepository.existsByTenDangNhapAndThoiGianXoaIsNull(request.getTenDangNhap())) {
            throw new NghiepVuException("Tên đăng nhập đã tồn tại", 400);
        }
        if (StringUtils.hasText(request.getEmail()) && !request.getEmail().equals(nguoiDung.getEmail()) &&
                nguoiDungRepository.existsByEmailAndThoiGianXoaIsNull(request.getEmail())) {
            throw new NghiepVuException("Email đã được sử dụng", 400);
        }

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
        nguoiDung.setTrangThai(
                StringUtils.hasText(request.getTrangThai()) ? request.getTrangThai() : nguoiDung.getTrangThai());

        nguoiDung = nguoiDungRepository.save(nguoiDung);

        capNhatVaiTroChoNguoiDung(nguoiDung, request.getDanhSachIdVaiTro());
        capNhatQuyenTrucTiepChoNguoiDung(nguoiDung, request.getDanhSachIdQuyen());

        return mapToResponse(nguoiDung);
    }

    @Transactional
    public void xoaMem(Long id) {
        NguoiDung nguoiDung = kiemTraTonTaiVaQuyen(id);
        nguoiDung.setThoiGianXoa(LocalDateTime.now());
        nguoiDung.setLyDoXoa("Xóa tài khoản");
        nguoiDungRepository.save(nguoiDung);
    }

    private void capNhatVaiTroChoNguoiDung(NguoiDung nguoiDung, List<Long> idVaiTroList) {
        nguoiDungVaiTroRepository.deleteByNguoiDungId(nguoiDung.getId());
        if (idVaiTroList != null && !idVaiTroList.isEmpty()) {
            List<VaiTro> vaiTroList = vaiTroRepository.findAllById(idVaiTroList);
            List<NguoiDungVaiTro> list = vaiTroList.stream().map(v -> {
                NguoiDungVaiTro nv = new NguoiDungVaiTro();
                nv.setNguoiDung(nguoiDung);
                nv.setVaiTro(v);
                return nv;
            }).collect(Collectors.toList());
            nguoiDungVaiTroRepository.saveAll(list);
        }
    }

    private NguoiDung kiemTraTonTaiVaQuyen(Long id) {
        NguoiDung nguoiDung = nguoiDungRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy người dùng", 404));
        Long idDonVi = DonViContextHolder.getTenantId();
        if ((idDonVi == null && nguoiDung.getIdDonVi() != null) ||
                (idDonVi != null && !idDonVi.equals(nguoiDung.getIdDonVi()))) {
            throw new NghiepVuException("Bạn không có quyền thao tác trên người dùng này", 403);
        }
        return nguoiDung;
    }

    private NguoiDungResponse mapToResponse(NguoiDung nguoiDung) {
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
                        .build())
                .collect(Collectors.toList());

        List<String> danhSachQuyenPhanGiai = quyenRepository.findAllByNguoiDungId(nguoiDung.getId()).stream()
                .map(Quyen::getMaQuyen)
                .collect(Collectors.toList());

        return NguoiDungResponse.builder()
                .id(nguoiDung.getId())
                .idDonVi(nguoiDung.getIdDonVi())
                .tenDangNhap(nguoiDung.getTenDangNhap())
                .hoNguoiDung(nguoiDung.getHoNguoiDung())
                .tenDemNguoiDung(nguoiDung.getTenDemNguoiDung())
                .tenNguoiDung(nguoiDung.getTenNguoiDung())
                .chucVu(nguoiDung.getChucVu())
                .email(nguoiDung.getEmail())
                .soDienThoai(nguoiDung.getSoDienThoai())
                .danhDaiDienUrl(nguoiDung.getDanhDaiDienUrl())
                .trangThai(nguoiDung.getTrangThai())
                .danhSachVaiTro(danhSachVaiTro)
                .danhSachQuyen(danhSachQuyen)
                .danhSachQuyenPhanGiai(danhSachQuyenPhanGiai)
                .build();
    }

    @Override
    @Transactional
    public void capNhatTrangThai(Long id, NguoiDungTrangThaiRequest request) {
        NguoiDung nguoiDung = kiemTraTonTaiVaQuyen(id);
        String trangThai = request.getTrangThai();
        if (!"HOAT_DONG".equals(trangThai) && !"KHOA".equals(trangThai)) {
            throw new NghiepVuException("Trạng thái không hợp lệ. Chỉ chấp nhận HOAT_DONG hoặc KHOA", 400);
        }
        nguoiDung.setTrangThai(trangThai);
        nguoiDungRepository.save(nguoiDung);
    }

    @Override
    @Transactional
    public void capNhatQuyenTrucTiep(Long id, NguoiDungQuyenUpdateRequest request) {
        NguoiDung nguoiDung = kiemTraTonTaiVaQuyen(id);
        capNhatQuyenTrucTiepChoNguoiDung(nguoiDung, request.getDanhSachIdQuyen());
    }

    private void capNhatQuyenTrucTiepChoNguoiDung(NguoiDung nguoiDung, List<Long> idQuyenList) {
        nguoiDungQuyenRepository.deleteByNguoiDungId(nguoiDung.getId());
        if (idQuyenList != null && !idQuyenList.isEmpty()) {
            List<Quyen> quyenList = quyenRepository.findAllById(idQuyenList);
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

        if (!"HOAT_DONG".equals(nguoiDung.getTrangThai())) {
            throw new NghiepVuException("Tài khoản người dùng hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }

        Long tenantId = DonViContextHolder.getTenantId();
        if (tenantId != null && !tenantId.equals(nguoiDung.getIdDonVi())) {
            throw new NghiepVuException("Bạn không có quyền xem thông tin người dùng thuộc đơn vị khác", 403);
        }

        return mapToResponse(nguoiDung);
    }
}
