package com.example.backend.modules.asset.service;

import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.dto.TaiSanPhanCungRequest;
import com.example.backend.modules.asset.dto.TaiSanPhanCungResponse;
import com.example.backend.modules.asset.model.DanhMucTaiSan;
import com.example.backend.modules.asset.model.HangSanXuat;
import com.example.backend.modules.asset.model.LoaiTaiSan;
import com.example.backend.modules.asset.model.TaiSanPhanCung;
import com.example.backend.modules.asset.repository.DanhMucTaiSanRepository;
import com.example.backend.modules.asset.repository.HangSanXuatRepository;
import com.example.backend.modules.asset.repository.LoaiTaiSanRepository;
import com.example.backend.modules.asset.repository.TaiSanPhanCungRepository;
import com.example.backend.modules.asset.service.interfaces.TaiSanPhanCungService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaiSanPhanCungServiceImpl implements TaiSanPhanCungService {

    private final TaiSanPhanCungRepository taiSanPhanCungRepository;
    private final DanhMucTaiSanRepository danhMucTaiSanRepository;
    private final LoaiTaiSanRepository loaiTaiSanRepository;
    private final HangSanXuatRepository hangSanXuatRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "tai_san_phan_cung_list_cache", key = "{#keyword, #trangThai, #page, #size, #sort}")
    public PageResponse<TaiSanPhanCungResponse> layDanhSach(String keyword, String trangThai, int page, int size, String sort) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortBy = sortParts[0];

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<TaiSanPhanCung> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));

            if (trangThai != null && !trangThai.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("trangThai"), trangThai.trim()));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                String keywordLower = "%" + keyword.trim().toLowerCase() + "%";
                Predicate maMauLike = cb.like(cb.lower(root.get("maMau")), keywordLower);
                Predicate tenMauLike = cb.like(cb.lower(root.get("tenMau")), keywordLower);
                predicates.add(cb.or(maMauLike, tenMauLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<TaiSanPhanCung> pageResult = taiSanPhanCungRepository.findAll(spec, pageRequest);
        Page<TaiSanPhanCungResponse> responsePage = pageResult.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "tai_san_phan_cung_cache", key = "#id")
    public TaiSanPhanCungResponse layTheoId(Long id) {
        TaiSanPhanCung taiSanPhanCung = taiSanPhanCungRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy mẫu tài sản phần cứng với ID: " + id, 404));
        if (!"HOAT_DONG".equals(taiSanPhanCung.getTrangThai())) {
            throw new NghiepVuException("Mẫu tài sản phần cứng hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }
        return mapToResponse(taiSanPhanCung);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"tai_san_phan_cung_cache", "tai_san_phan_cung_list_cache"}, allEntries = true)
    public TaiSanPhanCungResponse themMoi(TaiSanPhanCungRequest request) {
        if (taiSanPhanCungRepository.existsByMaMauAndThoiGianXoaIsNull(request.getMaMau())) {
            throw new NghiepVuException("Mã mẫu tài sản phần cứng đã tồn tại trong hệ thống", 400);
        }

        TaiSanPhanCung taiSanPhanCung = new TaiSanPhanCung();
        capNhatThongTin(taiSanPhanCung, request);
        taiSanPhanCung = taiSanPhanCungRepository.save(taiSanPhanCung);

        return mapToResponse(taiSanPhanCung);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"tai_san_phan_cung_cache", "tai_san_phan_cung_list_cache"}, allEntries = true)
    public TaiSanPhanCungResponse capNhat(Long id, TaiSanPhanCungRequest request) {
        TaiSanPhanCung taiSanPhanCung = taiSanPhanCungRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy mẫu tài sản phần cứng để cập nhật", 404));

        if (!taiSanPhanCung.getMaMau().equals(request.getMaMau()) &&
                taiSanPhanCungRepository.existsByMaMauAndThoiGianXoaIsNull(request.getMaMau())) {
            throw new NghiepVuException("Mã mẫu tài sản phần cứng mới đã tồn tại trong hệ thống", 400);
        }

        capNhatThongTin(taiSanPhanCung, request);
        taiSanPhanCung = taiSanPhanCungRepository.save(taiSanPhanCung);

        return mapToResponse(taiSanPhanCung);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"tai_san_phan_cung_cache", "tai_san_phan_cung_list_cache"}, allEntries = true)
    public void xoaMem(Long id) {
        TaiSanPhanCung taiSanPhanCung = taiSanPhanCungRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy mẫu tài sản phần cứng để xóa", 404));

        taiSanPhanCung.setThoiGianXoa(LocalDateTime.now());
        taiSanPhanCung.setLyDoXoa("Người dùng xóa");
        taiSanPhanCungRepository.save(taiSanPhanCung);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"tai_san_phan_cung_cache", "tai_san_phan_cung_list_cache"}, allEntries = true)
    public void capNhatTrangThai(Long id, TrangThaiRequest request) {
        TaiSanPhanCung taiSanPhanCung = taiSanPhanCungRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy mẫu tài sản phần cứng", 404));

        String status = request.getTrangThai();
        if (!"HOAT_DONG".equals(status) && !"KHOA".equals(status)) {
            throw new NghiepVuException("Trạng thái không hợp lệ. Chỉ chấp nhận HOAT_DONG hoặc KHOA", 400);
        }

        taiSanPhanCung.setTrangThai(status);
        taiSanPhanCungRepository.save(taiSanPhanCung);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SelectOption> laySelectOptions() {
        Specification<TaiSanPhanCung> spec = (root, query, cb) -> cb.and(
                cb.isNull(root.get("thoiGianXoa")),
                cb.equal(root.get("trangThai"), "HOAT_DONG")
        );
        return taiSanPhanCungRepository.findAll(spec).stream()
                .map(item -> SelectOption.builder()
                        .id(item.getId())
                        .ten(item.getTenMau())
                        .build())
                .collect(Collectors.toList());
    }

    private void capNhatThongTin(TaiSanPhanCung entity, TaiSanPhanCungRequest request) {
        DanhMucTaiSan dm = danhMucTaiSanRepository.findByIdAndThoiGianXoaIsNull(request.getIdDanhMucTaiSan())
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục tài sản", 400));
        LoaiTaiSan lts = loaiTaiSanRepository.findByIdAndThoiGianXoaIsNull(request.getIdLoaiTaiSan())
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy loại tài sản", 400));
        HangSanXuat hsx = hangSanXuatRepository.findByIdAndThoiGianXoaIsNull(request.getIdHangSanXuat())
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy hãng sản xuất", 400));

        entity.setDanhMucTaiSan(dm);
        entity.setLoaiTaiSan(lts);
        entity.setHangSanXuat(hsx);
        entity.setMaMau(request.getMaMau().trim());
        entity.setTenMau(request.getTenMau().trim());
        entity.setHinhAnh(request.getHinhAnh());
        entity.setCoTheThaoLap(request.getCoTheThaoLap());
        entity.setMoTa(request.getMoTa());
        entity.setTrangThai(request.getTrangThai() != null ? request.getTrangThai().trim() : "HOAT_DONG");
    }

    private TaiSanPhanCungResponse mapToResponse(TaiSanPhanCung entity) {
        return TaiSanPhanCungResponse.builder()
                .id(entity.getId())
                .idDanhMucTaiSan(entity.getDanhMucTaiSan() != null ? entity.getDanhMucTaiSan().getId() : null)
                .tenDanhMucTaiSan(entity.getDanhMucTaiSan() != null ? entity.getDanhMucTaiSan().getTenDanhMuc() : null)
                .idLoaiTaiSan(entity.getLoaiTaiSan() != null ? entity.getLoaiTaiSan().getId() : null)
                .tenLoaiTaiSan(entity.getLoaiTaiSan() != null ? entity.getLoaiTaiSan().getTenLoai() : null)
                .idHangSanXuat(entity.getHangSanXuat() != null ? entity.getHangSanXuat().getId() : null)
                .tenHangSanXuat(entity.getHangSanXuat() != null ? entity.getHangSanXuat().getTenHang() : null)
                .maMau(entity.getMaMau())
                .tenMau(entity.getTenMau())
                .hinhAnh(entity.getHinhAnh())
                .coTheThaoLap(entity.getCoTheThaoLap())
                .moTa(entity.getMoTa())
                .trangThai(entity.getTrangThai())
                .thoiGianTao(entity.getThoiGianTao())
                .thoiGianCapNhat(entity.getThoiGianCapNhat())
                .build();
    }
}
