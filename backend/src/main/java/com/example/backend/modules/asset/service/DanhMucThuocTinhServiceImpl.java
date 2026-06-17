package com.example.backend.modules.asset.service;

import com.example.backend.modules.asset.dto.DanhMucThuocTinhRequest;
import com.example.backend.modules.asset.dto.DanhMucThuocTinhResponse;
import com.example.backend.modules.asset.dto.LuaChonGoiYResponse;
import com.example.backend.modules.asset.model.DanhMucThuocTinh;
import com.example.backend.modules.asset.model.LuaChonGoiY;
import com.example.backend.modules.asset.repository.DanhMucThuocTinhRepository;
import com.example.backend.modules.asset.service.interfaces.DanhMucThuocTinhService;
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
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DanhMucThuocTinhServiceImpl implements DanhMucThuocTinhService {

    private final DanhMucThuocTinhRepository danhMucThuocTinhRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "danh_muc_thuoc_tinh_list_cache", key = "{#keyword, #apDungCho, #page, #size, #sort}")
    public PageResponse<DanhMucThuocTinhResponse> layDanhSach(String keyword, String apDungCho, int page, int size, String sort) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortBy = sortParts[0];

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<DanhMucThuocTinh> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));

            if (apDungCho != null && !apDungCho.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("apDungCho"), apDungCho.trim()));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                String keywordLower = "%" + keyword.trim().toLowerCase() + "%";
                Predicate maLike = cb.like(cb.lower(root.get("maThuocTinh")), keywordLower);
                Predicate tenLike = cb.like(cb.lower(root.get("tenThuocTinh")), keywordLower);
                predicates.add(cb.or(maLike, tenLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DanhMucThuocTinh> pageResult = danhMucThuocTinhRepository.findAll(spec, pageRequest);
        Page<DanhMucThuocTinhResponse> responsePage = pageResult.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "danh_muc_thuoc_tinh_cache", key = "#id")
    public DanhMucThuocTinhResponse layTheoId(Long id) {
        DanhMucThuocTinh ent = danhMucThuocTinhRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục thuộc tính với ID: " + id, 404));
        if (!"HOAT_DONG".equals(ent.getTrangThai())) {
            throw new NghiepVuException("Danh mục thuộc tính hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }
        return mapToResponse(ent);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"danh_muc_thuoc_tinh_list_cache", "danh_muc_thuoc_tinh_cache"}, allEntries = true)
    public DanhMucThuocTinhResponse themMoi(DanhMucThuocTinhRequest request) {
        if (danhMucThuocTinhRepository.existsByMaThuocTinhAndThoiGianXoaIsNull(request.getMaThuocTinh())) {
            throw new NghiepVuException("Mã thuộc tính đã tồn tại trong hệ thống", 400);
        }

        // Kiểm tra trùng lặp option trong payload
        if (request.getLuaChonGoiY() != null && !request.getLuaChonGoiY().isEmpty()) {
            long distinctCount = request.getLuaChonGoiY().stream()
                    .map(opt -> opt.getGiaTri().trim().toLowerCase())
                    .distinct()
                    .count();
            if (distinctCount < request.getLuaChonGoiY().size()) {
                throw new NghiepVuException("Danh sách lựa chọn gợi ý chứa giá trị bị trùng lặp", 400);
            }
        }

        DanhMucThuocTinh ent = new DanhMucThuocTinh();
        capNhatThongTin(ent, request);

        // Thêm các lựa chọn gợi ý lồng kèm
        if (request.getLuaChonGoiY() != null) {
            for (DanhMucThuocTinhRequest.LuaChonGoiYSubRequest subOpt : request.getLuaChonGoiY()) {
                LuaChonGoiY choice = new LuaChonGoiY();
                choice.setGiaTri(subOpt.getGiaTri().trim());
                choice.setTrangThai(subOpt.getTrangThai().trim());
                choice.setThuTuHienThi(subOpt.getThuTuHienThi());
                ent.addLuaChon(choice);
            }
        }

        ent = danhMucThuocTinhRepository.save(ent);
        return mapToResponse(ent);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"danh_muc_thuoc_tinh_list_cache", "danh_muc_thuoc_tinh_cache"}, allEntries = true)
    public DanhMucThuocTinhResponse capNhat(Long id, DanhMucThuocTinhRequest request) {
        DanhMucThuocTinh ent = danhMucThuocTinhRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục thuộc tính để cập nhật", 404));

        if (!ent.getMaThuocTinh().equals(request.getMaThuocTinh()) &&
                danhMucThuocTinhRepository.existsByMaThuocTinhAndThoiGianXoaIsNull(request.getMaThuocTinh())) {
            throw new NghiepVuException("Mã thuộc tính mới đã tồn tại trong hệ thống", 400);
        }

        // Kiểm tra trùng lặp option trong payload
        if (request.getLuaChonGoiY() != null && !request.getLuaChonGoiY().isEmpty()) {
            long distinctCount = request.getLuaChonGoiY().stream()
                    .map(opt -> opt.getGiaTri().trim().toLowerCase())
                    .distinct()
                    .count();
            if (distinctCount < request.getLuaChonGoiY().size()) {
                throw new NghiepVuException("Danh sách lựa chọn gợi ý chứa giá trị bị trùng lặp", 400);
            }
        }

        capNhatThongTin(ent, request);

        // ĐỒNG BỘ HÓA DANH SÁCH LỰA CHỌN GỢI Ý (Aggregate Update)
        List<DanhMucThuocTinhRequest.LuaChonGoiYSubRequest> reqOptions = request.getLuaChonGoiY() != null ?
                request.getLuaChonGoiY() : Collections.emptyList();

        List<Long> reqOptionIds = reqOptions.stream()
                .map(DanhMucThuocTinhRequest.LuaChonGoiYSubRequest::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // 1. Loại bỏ các option không xuất hiện trong request gửi lên (kích hoạt orphanRemoval)
        ent.getLuaChonGoiY().removeIf(opt -> opt.getId() != null && !reqOptionIds.contains(opt.getId()));

        // 2. Cập nhật các option cũ và thêm mới các option mới
        for (DanhMucThuocTinhRequest.LuaChonGoiYSubRequest reqOpt : reqOptions) {
            if (reqOpt.getId() != null) {
                // Cập nhật option cũ
                LuaChonGoiY existingOption = ent.getLuaChonGoiY().stream()
                        .filter(opt -> opt.getId().equals(reqOpt.getId()))
                        .findFirst()
                        .orElseThrow(() -> new NghiepVuException("Không tìm thấy lựa chọn gợi ý cần cập nhật với ID: " + reqOpt.getId(), 404));
                
                existingOption.setGiaTri(reqOpt.getGiaTri().trim());
                existingOption.setTrangThai(reqOpt.getTrangThai().trim());
                existingOption.setThuTuHienThi(reqOpt.getThuTuHienThi());
                existingOption.setThoiGianXoa(null);
                existingOption.setLyDoXoa(null);
            } else {
                // Tạo option mới
                LuaChonGoiY newOption = new LuaChonGoiY();
                newOption.setGiaTri(reqOpt.getGiaTri().trim());
                newOption.setTrangThai(reqOpt.getTrangThai().trim());
                newOption.setThuTuHienThi(reqOpt.getThuTuHienThi());
                ent.addLuaChon(newOption);
            }
        }

        ent = danhMucThuocTinhRepository.save(ent);
        return mapToResponse(ent);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"danh_muc_thuoc_tinh_list_cache", "danh_muc_thuoc_tinh_cache"}, allEntries = true)
    public void xoaMem(Long id) {
        DanhMucThuocTinh ent = danhMucThuocTinhRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục thuộc tính để xóa", 404));

        LocalDateTime now = LocalDateTime.now();
        // Xóa mềm các lựa chọn gợi ý đi kèm
        if (ent.getLuaChonGoiY() != null) {
            for (LuaChonGoiY choice : ent.getLuaChonGoiY()) {
                choice.setThoiGianXoa(now);
                choice.setLyDoXoa("Xóa theo danh mục thuộc tính");
            }
        }

        ent.setThoiGianXoa(now);
        ent.setLyDoXoa("Người dùng xóa");
        danhMucThuocTinhRepository.save(ent);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"danh_muc_thuoc_tinh_list_cache", "danh_muc_thuoc_tinh_cache"}, allEntries = true)
    public void capNhatTrangThai(Long id, TrangThaiRequest request) {
        DanhMucThuocTinh ent = danhMucThuocTinhRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục thuộc tính", 404));

        String status = request.getTrangThai();
        if (!"HOAT_DONG".equals(status) && !"KHOA".equals(status)) {
            throw new NghiepVuException("Trạng thái không hợp lệ. Chỉ chấp nhận HOAT_DONG hoặc KHOA", 400);
        }

        ent.setTrangThai(status);
        danhMucThuocTinhRepository.save(ent);
    }

    private void capNhatThongTin(DanhMucThuocTinh ent, DanhMucThuocTinhRequest request) {
        ent.setMaThuocTinh(request.getMaThuocTinh().trim());
        ent.setTenThuocTinh(request.getTenThuocTinh().trim());
        ent.setKieuDuLieu(request.getKieuDuLieu().trim());
        ent.setApDungCho(request.getApDungCho().trim());
        ent.setBatBuocNhap(request.getBatBuocNhap());
        ent.setGiaTriMacDinh(request.getGiaTriMacDinh() != null ? request.getGiaTriMacDinh().trim() : null);
        ent.setTrangThai(request.getTrangThai().trim());
    }

    private DanhMucThuocTinhResponse mapToResponse(DanhMucThuocTinh ent) {
        List<LuaChonGoiYResponse> choices = ent.getLuaChonGoiY() == null ? Collections.emptyList() :
                ent.getLuaChonGoiY().stream()
                        .filter(opt -> opt.getThoiGianXoa() == null)
                        .sorted(Comparator.comparing(LuaChonGoiY::getThuTuHienThi, Comparator.nullsLast(Comparator.naturalOrder())))
                        .map(this::mapChoiceToResponse)
                        .collect(Collectors.toList());

        return DanhMucThuocTinhResponse.builder()
                .id(ent.getId())
                .maThuocTinh(ent.getMaThuocTinh())
                .tenThuocTinh(ent.getTenThuocTinh())
                .kieuDuLieu(ent.getKieuDuLieu())
                .apDungCho(ent.getApDungCho())
                .batBuocNhap(ent.getBatBuocNhap())
                .giaTriMacDinh(ent.getGiaTriMacDinh())
                .trangThai(ent.getTrangThai())
                .thoiGianTao(ent.getThoiGianTao())
                .thoiGianCapNhat(ent.getThoiGianCapNhat())
                .luaChonGoiY(choices)
                .build();
    }

    private LuaChonGoiYResponse mapChoiceToResponse(LuaChonGoiY ent) {
        return LuaChonGoiYResponse.builder()
                .id(ent.getId())
                .idDanhMucThuocTinh(ent.getDanhMucThuocTinh().getId())
                .giaTri(ent.getGiaTri())
                .trangThai(ent.getTrangThai())
                .thuTuHienThi(ent.getThuTuHienThi())
                .thoiGianTao(ent.getThoiGianTao())
                .thoiGianCapNhat(ent.getThoiGianCapNhat())
                .build();
    }
}
