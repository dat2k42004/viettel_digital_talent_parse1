package com.example.backend.modules.auth.service;

import com.example.backend.modules.auth.service.interfaces.VaiTroService;
import com.example.backend.shared.model.TrangThaiCoBanEnum;

import com.example.backend.modules.auth.dto.QuyenResponse;
import com.example.backend.modules.auth.dto.VaiTroRequest;
import com.example.backend.modules.auth.dto.VaiTroResponse;
import com.example.backend.modules.auth.dto.VaiTroQuyenUpdateRequest;
import com.example.backend.modules.auth.dto.VaiTroDropdownResponse;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.modules.auth.model.Quyen;
import com.example.backend.modules.auth.model.VaiTro;
import com.example.backend.modules.auth.model.VaiTroQuyen;
import com.example.backend.modules.auth.repository.QuyenRepository;
import com.example.backend.modules.auth.repository.VaiTroQuyenRepository;
import com.example.backend.modules.auth.repository.VaiTroRepository;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VaiTroServiceImpl implements VaiTroService {

    private final VaiTroRepository vaiTroRepository;
    private final VaiTroQuyenRepository vaiTroQuyenRepository;
    private final QuyenRepository quyenRepository;
    private final com.example.backend.modules.auth.repository.NguoiDungVaiTroRepository nguoiDungVaiTroRepository;
    private final com.example.backend.modules.auth.repository.NguoiDungQuyenRepository nguoiDungQuyenRepository;
    private final org.springframework.cache.CacheManager cacheManager;

    @Override
    public PageResponse<VaiTroResponse> layDanhSach(String tenVaiTro, String maVaiTro, String trangThai, int page,
            int size) {
        Long idDonVi = DonViContextHolder.getTenantId();
        System.out.println("donvinexemdi:" + idDonVi);

        Specification<VaiTro> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            // predicates.add(cb.equal(root.get("trangThai"),
            // TrangThaiCoBanEnum.HOAT_DONG));

            // Phân quyền theo Đơn vị (Tenant) & Trạng thái
            if (idDonVi == null) {
                // Super Admin không lọc theo idDonVi, hiển thị toàn bộ
                if (org.springframework.util.StringUtils.hasText(trangThai)) {
                    try {
                        predicates.add(cb.equal(root.get("trangThai"), TrangThaiCoBanEnum.fromValue(trangThai.trim())));
                    } catch (IllegalArgumentException e) {
                        // Ignore
                    }
                }
            } else {
                // Người dùng thường chỉ xem vai trò của đơn vị mình và đang HOAT_DONG
                predicates.add(cb.equal(root.get("idDonVi"), idDonVi));
                predicates.add(cb.equal(root.get("trangThai"), TrangThaiCoBanEnum.HOAT_DONG));
            }

            if (tenVaiTro != null && !tenVaiTro.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("tenVaiTro")), "%" + tenVaiTro.trim().toLowerCase() + "%"));
            }

            if (maVaiTro != null && !maVaiTro.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("maVaiTro")), "%" + maVaiTro.trim().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<VaiTro> pageResult = vaiTroRepository.findAll(spec,
                PageRequest.of(page, size, Sort.by("id").descending()));
        Page<VaiTroResponse> responsePage = pageResult.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Transactional
    public VaiTroResponse themMoi(VaiTroRequest request) {
        Long idDonVi = DonViContextHolder.getTenantId();

        VaiTro vaiTro = new VaiTro();
        if (idDonVi == null) {
            // Super Admin có thể chỉ định đơn vị (hoặc null cho hệ thống)
            vaiTro.setIdDonVi(request.getIdDonVi());
            vaiTro.setLaHeThong(request.getIdDonVi() == null);
        } else {
            // Admin cơ sở luôn thuộc đơn vị của họ
            vaiTro.setIdDonVi(idDonVi);
            vaiTro.setLaHeThong(false);
        }

        Long effectiveDonViId = vaiTro.getIdDonVi() != null ? vaiTro.getIdDonVi() : 0L;
        vaiTro.setMaVaiTro("ROLE-" + effectiveDonViId + "-" + System.currentTimeMillis());
        vaiTro.setTenVaiTro(request.getTenVaiTro());
        vaiTro.setMoTaVaiTro(request.getMoTa());
        vaiTro.setTrangThai(TrangThaiCoBanEnum.HOAT_DONG);
        vaiTro = vaiTroRepository.save(vaiTro);

        capNhatQuyenChoVaiTro(vaiTro, request.getDanhSachIdQuyen());

        return mapToResponse(vaiTro);
    }

    @Transactional
    public VaiTroResponse capNhat(Long id, VaiTroRequest request) {
        VaiTro vaiTro = kiemTraTonTaiVaQuyen(id);
        Long tenantId = DonViContextHolder.getTenantId();

        vaiTro.setTenVaiTro(request.getTenVaiTro());
        vaiTro.setMoTaVaiTro(request.getMoTa());

        if (tenantId == null) {
            // Super Admin có thể chỉ định đơn vị (hoặc null cho hệ thống)
            vaiTro.setIdDonVi(request.getIdDonVi());
            vaiTro.setLaHeThong(request.getIdDonVi() == null);
        } else {
            // Admin cơ sở luôn giữ vai trò thuộc đơn vị của họ
            vaiTro.setIdDonVi(tenantId);
            vaiTro.setLaHeThong(null);
        }

        // Cập nhật mã vai trò mới khớp với đơn vị nếu có thay đổi
        Long effectiveDonViId = vaiTro.getIdDonVi() != null ? vaiTro.getIdDonVi() : 0L;
        if (vaiTro.getMaVaiTro() == null || !vaiTro.getMaVaiTro().startsWith("ROLE-" + effectiveDonViId + "-")) {
            vaiTro.setMaVaiTro("ROLE-" + effectiveDonViId + "-" + System.currentTimeMillis());
        }

        vaiTro = vaiTroRepository.save(vaiTro);

        capNhatQuyenChoVaiTro(vaiTro, request.getDanhSachIdQuyen());
        return mapToResponse(vaiTro);
    }

    @Transactional
    public void xoaMem(Long id) {
        VaiTro vaiTro = kiemTraTonTaiVaQuyen(id);
        vaiTro.setThoiGianXoa(LocalDateTime.now());
        vaiTro.setLyDoXoa("Người dùng yếuu cầu xóa");
        vaiTroRepository.save(vaiTro);
    }

    private void capNhatQuyenChoVaiTro(VaiTro vaiTro, List<Long> idQuyenList) {
        vaiTroQuyenRepository.deleteByVaiTroId(vaiTro.getId());
        if (idQuyenList != null && !idQuyenList.isEmpty()) {
            List<Quyen> quyenList = quyenRepository.findAllByIdInAndThoiGianXoaIsNull(idQuyenList);
            List<VaiTroQuyen> vaiTroQuyenList = quyenList.stream().map(q -> {
                VaiTroQuyen vq = new VaiTroQuyen();
                vq.setVaiTro(vaiTro);
                vq.setQuyen(q);
                return vq;
            }).collect(Collectors.toList());
            vaiTroQuyenRepository.saveAll(vaiTroQuyenList);
        }
        dongBoQuyenTheoVaiTro(vaiTro.getId());
    }

    private void dongBoQuyenTheoVaiTro(Long vaiTroId) {
        List<com.example.backend.modules.auth.model.NguoiDungVaiTro> userRoles = nguoiDungVaiTroRepository
                .findByVaiTroId(vaiTroId);
        for (com.example.backend.modules.auth.model.NguoiDungVaiTro ur : userRoles) {
            dongBoQuyenNguoiDung(ur.getNguoiDung());
        }
    }

    private void dongBoQuyenNguoiDung(com.example.backend.modules.auth.model.NguoiDung user) {
        nguoiDungQuyenRepository.deleteByNguoiDungId(user.getId());
        List<com.example.backend.modules.auth.model.NguoiDungVaiTro> userRoles = nguoiDungVaiTroRepository
                .findByNguoiDungId(user.getId());

        // Evict user permissions cache
        if (cacheManager != null && cacheManager.getCache("user_permissions") != null) {
            cacheManager.getCache("user_permissions").evict(user.getId());
        }

        if (userRoles.isEmpty()) {
            return;
        }

        List<Long> roleIds = userRoles.stream().map(ur -> ur.getVaiTro().getId()).collect(Collectors.toList());
        List<VaiTroQuyen> rolePermissions = vaiTroQuyenRepository.findByVaiTroIdIn(roleIds);

        List<Quyen> uniquePermissions = rolePermissions.stream()
                .map(VaiTroQuyen::getQuyen)
                .filter(q -> q.getThoiGianXoa() == null && q.getTrangThai() == TrangThaiCoBanEnum.HOAT_DONG)
                .distinct()
                .collect(Collectors.toList());

        List<com.example.backend.modules.auth.model.NguoiDungQuyen> userPerms = uniquePermissions.stream().map(q -> {
            com.example.backend.modules.auth.model.NguoiDungQuyen nq = new com.example.backend.modules.auth.model.NguoiDungQuyen();
            nq.setNguoiDung(user);
            nq.setQuyen(q);
            return nq;
        }).collect(Collectors.toList());

        nguoiDungQuyenRepository.saveAll(userPerms);
    }

    private VaiTro kiemTraTonTaiVaQuyen(Long id) {
        VaiTro vaiTro = vaiTroRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy vai trò", 404));
        Long idDonVi = DonViContextHolder.getTenantId();
        if (idDonVi != null && !idDonVi.equals(vaiTro.getIdDonVi())) {
            throw new NghiepVuException("Bạn không có quyền thao tác trên vai trò này", 403);
        }
        return vaiTro;
    }

    private VaiTroResponse mapToResponse(VaiTro vaiTro) {
        List<QuyenResponse> danhSachQuyen = vaiTroQuyenRepository.findByVaiTroId(vaiTro.getId()).stream()
                .map(vq -> QuyenResponse.builder()
                        .id(vq.getQuyen().getId())
                        .maQuyen(vq.getQuyen().getMaQuyen())
                        .tenQuyen(vq.getQuyen().getTenQuyen())
                        .idQuyenCha(vq.getQuyen().getIdQuyenCha())
                        .loaiQuyen(vq.getQuyen().getLoaiQuyen())
                        .build())
                .collect(Collectors.toList());

        return VaiTroResponse.builder()
                .id(vaiTro.getId())
                .idDonVi(vaiTro.getIdDonVi())
                .maVaiTro(vaiTro.getMaVaiTro())
                .tenVaiTro(vaiTro.getTenVaiTro())
                .moTa(vaiTro.getMoTaVaiTro())
                .trangThai(vaiTro.getTrangThai() != null ? vaiTro.getTrangThai().getValue() : null)
                .laHeThong(vaiTro.getLaHeThong())
                .capDoUuTien(vaiTro.getCapDoUuTien())
                .danhSachQuyen(danhSachQuyen)
                .build();
    }

    @Override
    @Transactional
    public void capNhatQuyen(Long id, VaiTroQuyenUpdateRequest request) {
        VaiTro vaiTro = kiemTraTonTaiVaQuyen(id);
        capNhatQuyenChoVaiTro(vaiTro, request.getDanhSachIdQuyen());
    }

    @Override
    @Transactional
    public void capNhatTrangThai(Long id, TrangThaiRequest request) {
        VaiTro vaiTro = kiemTraTonTaiVaQuyen(id);
        String status = request.getTrangThai();
        try {
            vaiTro.setTrangThai(TrangThaiCoBanEnum.fromValue(status));
        } catch (IllegalArgumentException e) {
            throw new NghiepVuException("exception.common.invalid_status", 400);
        }
        vaiTroRepository.save(vaiTro);
    }

    @Override
    public VaiTroResponse layTheoId(Long id) {
        Long idDonVi = DonViContextHolder.getTenantId();
        VaiTro vaiTro = vaiTroRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy vai trò hoặc vai trò đã bị xóa", 404));

        if (vaiTro.getTrangThai() != TrangThaiCoBanEnum.HOAT_DONG) {
            throw new NghiepVuException("Vai trò hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }

        if (idDonVi != null && vaiTro.getIdDonVi() != null && !idDonVi.equals(vaiTro.getIdDonVi())) {
            throw new NghiepVuException("Bạn không có quyền xem vai trò thuộc đơn vị khác", 403);
        }

        return mapToResponse(vaiTro);
    }

    @Override
    public List<VaiTroDropdownResponse> layDropdown(String keyword) {
        Long idDonVi = DonViContextHolder.getTenantId();
        List<VaiTro> roles;

        // Multi-tenant check & query
        if (idDonVi == null) {
            // Super Admin lấy tất cả vai trò hoạt động trong hệ thống
            roles = vaiTroRepository.findByTrangThaiAndThoiGianXoaIsNull(TrangThaiCoBanEnum.HOAT_DONG);
        } else {
            // Admin cấp cơ sở lấy các vai trò của đơn vị mình
            roles = vaiTroRepository.findByIdDonViAndTrangThaiAndThoiGianXoaIsNull(idDonVi,
                    TrangThaiCoBanEnum.HOAT_DONG);
        }

        java.util.stream.Stream<VaiTro> stream = roles.stream();
        if (org.springframework.util.StringUtils.hasText(keyword)) {
            String searchKw = keyword.trim().toLowerCase();
            stream = stream.filter(r -> (r.getTenVaiTro() != null && r.getTenVaiTro().toLowerCase().contains(searchKw))
                    || (r.getMaVaiTro() != null && r.getMaVaiTro().toLowerCase().contains(searchKw)));
        }

        return stream
                .limit(50)
                .map(r -> VaiTroDropdownResponse.builder()
                        .id(r.getId())
                        .maVaiTro(r.getMaVaiTro())
                        .tenVaiTro(r.getTenVaiTro())
                        .build())
                .collect(Collectors.toList());
    }
}
