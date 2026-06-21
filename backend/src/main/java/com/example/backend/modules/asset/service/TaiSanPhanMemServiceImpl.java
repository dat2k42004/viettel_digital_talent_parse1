package com.example.backend.modules.asset.service;

import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.dto.TaiSanPhanMemRequest;
import com.example.backend.modules.asset.dto.TaiSanPhanMemResponse;
import com.example.backend.modules.asset.model.DanhMucTaiSan;
import com.example.backend.modules.asset.model.HangSanXuat;
import com.example.backend.modules.asset.model.LoaiTaiSan;
import com.example.backend.modules.asset.model.TaiSanPhanMem;
import com.example.backend.modules.asset.repository.DanhMucTaiSanRepository;
import com.example.backend.modules.asset.repository.HangSanXuatRepository;
import com.example.backend.modules.asset.repository.LoaiTaiSanRepository;
import com.example.backend.modules.asset.repository.TaiSanPhanMemRepository;
import com.example.backend.modules.asset.service.interfaces.TaiSanPhanMemService;
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
public class TaiSanPhanMemServiceImpl implements TaiSanPhanMemService {

    private final TaiSanPhanMemRepository taiSanPhanMemRepository;
    private final DanhMucTaiSanRepository danhMucTaiSanRepository;
    private final LoaiTaiSanRepository loaiTaiSanRepository;
    private final HangSanXuatRepository hangSanXuatRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "tai_san_phan_mem_list_cache", key = "{#keyword, #trangThai, #page, #size, #sort}")
    public PageResponse<TaiSanPhanMemResponse> layDanhSach(String keyword, String trangThai, int page, int size, String sort) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortBy = sortParts[0];

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<TaiSanPhanMem> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));

            if (trangThai != null && !trangThai.trim().isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("trangThai"), com.example.backend.shared.model.TrangThaiCoBanEnum.fromValue(trangThai.trim())));
                } catch (IllegalArgumentException e) {
                    throw new NghiepVuException(e.getMessage(), 400);
                }
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                String keywordLower = "%" + keyword.trim().toLowerCase() + "%";
                Predicate maMauLike = cb.like(cb.lower(root.get("maMau")), keywordLower);
                Predicate tenMauLike = cb.like(cb.lower(root.get("tenMau")), keywordLower);
                predicates.add(cb.or(maMauLike, tenMauLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<TaiSanPhanMem> pageResult = taiSanPhanMemRepository.findAll(spec, pageRequest);
        Page<TaiSanPhanMemResponse> responsePage = pageResult.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "tai_san_phan_mem_cache", key = "#id")
    public TaiSanPhanMemResponse layTheoId(Long id) {
        TaiSanPhanMem taiSanPhanMem = taiSanPhanMemRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy mẫu tài sản phần mềm với ID: " + id, 404));
        if (taiSanPhanMem.getTrangThai() != com.example.backend.shared.model.TrangThaiCoBanEnum.HOAT_DONG) {
            throw new NghiepVuException("Mẫu tài sản phần mềm hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }
        return mapToResponse(taiSanPhanMem);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"tai_san_phan_mem_cache", "tai_san_phan_mem_list_cache"}, allEntries = true)
    public TaiSanPhanMemResponse themMoi(TaiSanPhanMemRequest request) {
        TaiSanPhanMem taiSanPhanMem = new TaiSanPhanMem();
        capNhatThongTin(taiSanPhanMem, request);
        taiSanPhanMem.setMaMau("TSPM-0-" + System.currentTimeMillis());
        taiSanPhanMem = taiSanPhanMemRepository.save(taiSanPhanMem);

        return mapToResponse(taiSanPhanMem);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"tai_san_phan_mem_cache", "tai_san_phan_mem_list_cache"}, allEntries = true)
    public TaiSanPhanMemResponse capNhat(Long id, TaiSanPhanMemRequest request) {
        TaiSanPhanMem taiSanPhanMem = taiSanPhanMemRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy mẫu tài sản phần mềm để cập nhật", 404));

        capNhatThongTin(taiSanPhanMem, request);
        taiSanPhanMem = taiSanPhanMemRepository.save(taiSanPhanMem);

        return mapToResponse(taiSanPhanMem);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"tai_san_phan_mem_cache", "tai_san_phan_mem_list_cache"}, allEntries = true)
    public void xoaMem(Long id) {
        TaiSanPhanMem taiSanPhanMem = taiSanPhanMemRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy mẫu tài sản phần mềm để xóa", 404));

        taiSanPhanMem.setThoiGianXoa(LocalDateTime.now());
        taiSanPhanMem.setLyDoXoa("Người dùng xóa");
        taiSanPhanMemRepository.save(taiSanPhanMem);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"tai_san_phan_mem_cache", "tai_san_phan_mem_list_cache"}, allEntries = true)
    public void capNhatTrangThai(Long id, TrangThaiRequest request) {
        TaiSanPhanMem taiSanPhanMem = taiSanPhanMemRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy mẫu tài sản phần mềm", 404));

        String status = request.getTrangThai();
        com.example.backend.shared.model.TrangThaiCoBanEnum trangThaiEnum;
        try {
            trangThaiEnum = com.example.backend.shared.model.TrangThaiCoBanEnum.fromValue(status);
        } catch (IllegalArgumentException e) {
            throw new NghiepVuException(e.getMessage(), 400);
        }

        taiSanPhanMem.setTrangThai(trangThaiEnum);
        taiSanPhanMemRepository.save(taiSanPhanMem);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SelectOption> laySelectOptions() {
        Specification<TaiSanPhanMem> spec = (root, query, cb) -> cb.and(
                cb.isNull(root.get("thoiGianXoa")),
                cb.equal(root.get("trangThai"), com.example.backend.shared.model.TrangThaiCoBanEnum.HOAT_DONG)
        );
        return taiSanPhanMemRepository.findAll(spec).stream()
                .map(item -> SelectOption.builder()
                        .id(item.getId())
                        .ten(item.getTenMau())
                        .build())
                .collect(Collectors.toList());
    }

    private void capNhatThongTin(TaiSanPhanMem entity, TaiSanPhanMemRequest request) {
        DanhMucTaiSan dm = danhMucTaiSanRepository.findByIdAndThoiGianXoaIsNull(request.getIdDanhMucTaiSan())
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục tài sản", 400));
        LoaiTaiSan lts = loaiTaiSanRepository.findByIdAndThoiGianXoaIsNull(request.getIdLoaiTaiSan())
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy loại tài sản", 400));
        HangSanXuat hsx = hangSanXuatRepository.findByIdAndThoiGianXoaIsNull(request.getIdHangSanXuat())
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy hãng sản xuất", 400));

        entity.setDanhMucTaiSan(dm);
        entity.setLoaiTaiSan(lts);
        entity.setHangSanXuat(hsx);
        entity.setTenMau(request.getTenMau().trim());
        entity.setHinhAnh(request.getHinhAnh());
        entity.setHinhThucTrienKhai(request.getHinhThucTrienKhai());
        entity.setNenTangHoTro(request.getNenTangHoTro());
        entity.setHinhThucCapPhep(request.getHinhThucCapPhep());
        entity.setMoTa(request.getMoTa());
        String statusStr = request.getTrangThai() != null ? request.getTrangThai().trim() : "HOAT_DONG";
        try {
            entity.setTrangThai(com.example.backend.shared.model.TrangThaiCoBanEnum.fromValue(statusStr));
        } catch (IllegalArgumentException e) {
            throw new NghiepVuException(e.getMessage(), 400);
        }
    }

    private TaiSanPhanMemResponse mapToResponse(TaiSanPhanMem entity) {
        return TaiSanPhanMemResponse.builder()
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
                .hinhThucTrienKhai(entity.getHinhThucTrienKhai())
                .nenTangHoTro(entity.getNenTangHoTro())
                .hinhThucCapPhep(entity.getHinhThucCapPhep())
                .moTa(entity.getMoTa())
                .trangThai(entity.getTrangThai() != null ? entity.getTrangThai().getValue() : null)
                .thoiGianTao(entity.getThoiGianTao())
                .thoiGianCapNhat(entity.getThoiGianCapNhat())
                .build();
    }
}
