package com.example.backend.modules.asset.service;

import com.example.backend.modules.asset.dto.DanhSachThietBiPhanCungRequest;
import com.example.backend.modules.asset.dto.DanhSachThietBiPhanCungResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanCung;
import com.example.backend.modules.asset.model.TaiSanPhanCung;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanCungRepository;
import com.example.backend.modules.asset.repository.TaiSanPhanCungRepository;
import com.example.backend.modules.asset.service.interfaces.DanhSachThietBiPhanCungService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DanhSachThietBiPhanCungServiceImpl implements DanhSachThietBiPhanCungService {

    private final DanhSachThietBiPhanCungRepository thietBiPhanCungRepository;
    private final TaiSanPhanCungRepository taiSanPhanCungRepository;

    private Long getRequiredTenantId() {
        Long tenantId = DonViContextHolder.getTenantId();
        if (tenantId == null) {
            throw new NghiepVuException("Không tìm thấy thông tin đơn vị từ phiên làm việc", 403);
        }
        return tenantId;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "thiet_bi_phan_cung_list_cache", key = "{#keyword, #trangThai, #tuNgayMua, #denNgayMua, #trangThaiKho, #page, #size, #sort, T(com.example.backend.shared.tenant.DonViContextHolder).getTenantId()}")
    public PageResponse<DanhSachThietBiPhanCungResponse> layDanhSach(
            String keyword,
            String trangThai,
            LocalDate tuNgayMua,
            LocalDate denNgayMua,
            String trangThaiKho,
            int page,
            int size,
            String sort
    ) {
        Long idDonVi = getRequiredTenantId();
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortBy = sortParts[0];

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<DanhSachThietBiPhanCung> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            predicates.add(cb.equal(root.get("idDonVi"), idDonVi));

            if (trangThai != null && !trangThai.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("trangThai"), trangThai.trim()));
            }

            if (trangThaiKho != null && !trangThaiKho.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("trangThaiKho"), trangThaiKho.trim()));
            }

            if (tuNgayMua != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianMua"), tuNgayMua));
            }

            if (denNgayMua != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianMua"), denNgayMua));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                String keywordLower = "%" + keyword.trim().toLowerCase() + "%";
                Predicate serialLike = cb.like(cb.lower(root.get("soSerial")), keywordLower);
                Predicate cardLike = cb.like(cb.lower(root.get("maTheTaiSan")), keywordLower);
                predicates.add(cb.or(serialLike, cardLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DanhSachThietBiPhanCung> pageResult = thietBiPhanCungRepository.findAll(spec, pageRequest);
        Page<DanhSachThietBiPhanCungResponse> responsePage = pageResult.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "thiet_bi_phan_cung_cache", key = "{#id, T(com.example.backend.shared.tenant.DonViContextHolder).getTenantId()}")
    public DanhSachThietBiPhanCungResponse layTheoId(Long id) {
        Long idDonVi = getRequiredTenantId();
        DanhSachThietBiPhanCung thietBi = thietBiPhanCungRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy thiết bị phần cứng thuộc đơn vị của bạn với ID: " + id, 404));
        if (!"HOAT_DONG".equals(thietBi.getTrangThai())) {
            throw new NghiepVuException("Thiết bị phần cứng hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }
        return mapToResponse(thietBi);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"thiet_bi_phan_cung_cache", "thiet_bi_phan_cung_list_cache"}, allEntries = true)
    public DanhSachThietBiPhanCungResponse themMoi(DanhSachThietBiPhanCungRequest request) {
        Long idDonVi = getRequiredTenantId();

        if (thietBiPhanCungRepository.existsBySoSerialAndIdDonViAndThoiGianXoaIsNull(request.getSoSerial(), idDonVi)) {
            throw new NghiepVuException("Số Serial đã tồn tại trong đơn vị", 400);
        }
        if (thietBiPhanCungRepository.existsByMaTheTaiSanAndIdDonViAndThoiGianXoaIsNull(request.getMaTheTaiSan(), idDonVi)) {
            throw new NghiepVuException("Mã thẻ tài sản đã tồn tại trong đơn vị", 400);
        }

        DanhSachThietBiPhanCung thietBi = new DanhSachThietBiPhanCung();
        thietBi.setIdDonVi(idDonVi);
        capNhatThongTin(thietBi, request);
        thietBi = thietBiPhanCungRepository.save(thietBi);

        return mapToResponse(thietBi);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"thiet_bi_phan_cung_cache", "thiet_bi_phan_cung_list_cache"}, allEntries = true)
    public DanhSachThietBiPhanCungResponse capNhat(Long id, DanhSachThietBiPhanCungRequest request) {
        Long idDonVi = getRequiredTenantId();
        DanhSachThietBiPhanCung thietBi = thietBiPhanCungRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy thiết bị phần cứng để cập nhật", 404));

        if (!thietBi.getSoSerial().equals(request.getSoSerial()) &&
                thietBiPhanCungRepository.existsBySoSerialAndIdDonViAndThoiGianXoaIsNull(request.getSoSerial(), idDonVi)) {
            throw new NghiepVuException("Số Serial mới đã tồn tại trong đơn vị", 400);
        }
        if (!thietBi.getMaTheTaiSan().equals(request.getMaTheTaiSan()) &&
                thietBiPhanCungRepository.existsByMaTheTaiSanAndIdDonViAndThoiGianXoaIsNull(request.getMaTheTaiSan(), idDonVi)) {
            throw new NghiepVuException("Mã thẻ tài sản mới đã tồn tại trong đơn vị", 400);
        }

        capNhatThongTin(thietBi, request);
        thietBi = thietBiPhanCungRepository.save(thietBi);

        return mapToResponse(thietBi);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"thiet_bi_phan_cung_cache", "thiet_bi_phan_cung_list_cache"}, allEntries = true)
    public void xoaMem(Long id) {
        Long idDonVi = getRequiredTenantId();
        DanhSachThietBiPhanCung thietBi = thietBiPhanCungRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy thiết bị phần cứng để xóa", 404));

        thietBi.setThoiGianXoa(LocalDateTime.now());
        thietBi.setLyDoXoa("Người dùng xóa");
        thietBiPhanCungRepository.save(thietBi);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"thiet_bi_phan_cung_cache", "thiet_bi_phan_cung_list_cache"}, allEntries = true)
    public void capNhatTrangThai(Long id, TrangThaiRequest request) {
        Long idDonVi = getRequiredTenantId();
        DanhSachThietBiPhanCung thietBi = thietBiPhanCungRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy thiết bị phần cứng", 404));

        String status = request.getTrangThai();
        if (!"HOAT_DONG".equals(status) && !"KHOA".equals(status)) {
            throw new NghiepVuException("Trạng thái không hợp lệ. Chỉ chấp nhận HOAT_DONG hoặc KHOA", 400);
        }

        thietBi.setTrangThai(status);
        thietBiPhanCungRepository.save(thietBi);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SelectOption> laySelectOptions() {
        Long idDonVi = getRequiredTenantId();
        Specification<DanhSachThietBiPhanCung> spec = (root, query, cb) -> cb.and(
                cb.isNull(root.get("thoiGianXoa")),
                cb.equal(root.get("idDonVi"), idDonVi),
                cb.equal(root.get("trangThai"), "HOAT_DONG")
        );
        return thietBiPhanCungRepository.findAll(spec).stream()
                .map(item -> SelectOption.builder()
                        .id(item.getId())
                        .ten(item.getMaTheTaiSan() + " - " + item.getSoSerial())
                        .build())
                .collect(Collectors.toList());
    }

    private void capNhatThongTin(DanhSachThietBiPhanCung thietBi, DanhSachThietBiPhanCungRequest request) {
        TaiSanPhanCung mau = taiSanPhanCungRepository.findByIdAndThoiGianXoaIsNull(request.getIdTaiSanPhanCung())
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy mẫu tài sản phần cứng tương ứng", 400));

        thietBi.setTaiSanPhanCung(mau);
        thietBi.setIdNhaCungCap(request.getIdNhaCungCap());
        thietBi.setSoSerial(request.getSoSerial().trim());
        thietBi.setMaTheTaiSan(request.getMaTheTaiSan().trim());
        thietBi.setGiaMua(request.getGiaMua());
        thietBi.setThoiGianMua(request.getThoiGianMua());
        thietBi.setHanBaoHanhThang(request.getHanBaoHanhThang());
        thietBi.setTrangThaiKho(request.getTrangThaiKho() != null ? request.getTrangThaiKho().trim() : null);
        thietBi.setViTriKho(request.getViTriKho() != null ? request.getViTriKho().trim() : null);
        thietBi.setTrangThai(request.getTrangThai() != null ? request.getTrangThai().trim() : "HOAT_DONG");
    }

    private DanhSachThietBiPhanCungResponse mapToResponse(DanhSachThietBiPhanCung thietBi) {
        return DanhSachThietBiPhanCungResponse.builder()
                .id(thietBi.getId())
                .idTaiSanPhanCung(thietBi.getTaiSanPhanCung() != null ? thietBi.getTaiSanPhanCung().getId() : null)
                .tenTaiSanPhanCung(thietBi.getTaiSanPhanCung() != null ? thietBi.getTaiSanPhanCung().getTenMau() : null)
                .maMauTaiSanPhanCung(thietBi.getTaiSanPhanCung() != null ? thietBi.getTaiSanPhanCung().getMaMau() : null)
                .idNhaCungCap(thietBi.getIdNhaCungCap())
                .idDonVi(thietBi.getIdDonVi())
                .soSerial(thietBi.getSoSerial())
                .maTheTaiSan(thietBi.getMaTheTaiSan())
                .giaMua(thietBi.getGiaMua())
                .thoiGianMua(thietBi.getThoiGianMua())
                .hanBaoHanhThang(thietBi.getHanBaoHanhThang())
                .trangThaiKho(thietBi.getTrangThaiKho())
                .viTriKho(thietBi.getViTriKho())
                .trangThai(thietBi.getTrangThai())
                .thoiGianTao(thietBi.getThoiGianTao())
                .thoiGianCapNhat(thietBi.getThoiGianCapNhat())
                .build();
    }
}
