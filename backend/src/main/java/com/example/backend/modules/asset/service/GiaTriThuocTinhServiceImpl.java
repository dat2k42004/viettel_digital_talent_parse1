package com.example.backend.modules.asset.service;

import com.example.backend.modules.asset.dto.GiaTriThuocTinhBulkSaveRequest;
import com.example.backend.modules.asset.dto.GiaTriThuocTinhResponse;
import com.example.backend.modules.asset.model.DanhMucThuocTinh;
import com.example.backend.modules.asset.model.GiaTriThuocTinh;
import com.example.backend.modules.asset.model.LuaChonGoiY;
import com.example.backend.modules.asset.repository.DanhMucThuocTinhRepository;
import com.example.backend.modules.asset.repository.GiaTriThuocTinhRepository;
import com.example.backend.modules.asset.repository.LuaChonGoiYRepository;
import com.example.backend.modules.asset.service.interfaces.GiaTriThuocTinhService;
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

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GiaTriThuocTinhServiceImpl implements GiaTriThuocTinhService {

    private final GiaTriThuocTinhRepository giaTriThuocTinhRepository;
    private final DanhMucThuocTinhRepository danhMucThuocTinhRepository;
    private final LuaChonGoiYRepository luaChonGoiYRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "gia_tri_thuoc_tinh_list_cache", key = "{#idTaiSan, #loaiTaiSan, #page, #size, T(com.example.backend.shared.tenant.DonViContextHolder).getTenantId()}")
    public PageResponse<GiaTriThuocTinhResponse> layDanhSach(Long idTaiSan, String loaiTaiSan, int page, int size, String sort) {
        Long idDonVi = DonViContextHolder.getTenantId();
        if (idDonVi == null) {
            throw new NghiepVuException("Không xác định được đơn vị (Tenant ID) của người dùng", 403);
        }

        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortBy = sortParts[0];

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<GiaTriThuocTinh> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            predicates.add(cb.equal(root.get("idDonVi"), idDonVi));

            if (idTaiSan != null) {
                predicates.add(cb.equal(root.get("idTaiSan"), idTaiSan));
            }

            if (loaiTaiSan != null && !loaiTaiSan.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("loaiTaiSan"), loaiTaiSan.trim()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<GiaTriThuocTinh> pageResult = giaTriThuocTinhRepository.findAll(spec, pageRequest);
        Page<GiaTriThuocTinhResponse> responsePage = pageResult.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional
    @CacheEvict(value = "gia_tri_thuoc_tinh_list_cache", allEntries = true)
    public List<GiaTriThuocTinhResponse> saveBulk(GiaTriThuocTinhBulkSaveRequest request) {
        Long idDonVi = DonViContextHolder.getTenantId();
        if (idDonVi == null) {
            throw new NghiepVuException("Không xác định được đơn vị (Tenant ID) để lưu thông số", 403);
        }

        // 1. Kiểm tra trùng lặp thuộc tính trong payload
        List<GiaTriThuocTinhBulkSaveRequest.AttributeValueItem> requestValues = request.getValues();
        long uniqueCount = requestValues.stream()
                .map(GiaTriThuocTinhBulkSaveRequest.AttributeValueItem::getDanhMucThuocTinhId)
                .distinct()
                .count();
        if (uniqueCount < requestValues.size()) {
            throw new NghiepVuException("Mã danh mục thuộc tính bị trùng lặp trong yêu cầu lưu hàng loạt", 400);
        }

        // Lấy tất cả thuộc tính động áp dụng cho loại tài sản này để đối chiếu
        Specification<DanhMucThuocTinh> specAttr = (root, query, cb) -> cb.and(
                cb.isNull(root.get("thoiGianXoa")),
                cb.equal(root.get("apDungCho"), request.getLoaiTaiSan()),
                cb.equal(root.get("trangThai"), "HOAT_DONG")
        );
        List<DanhMucThuocTinh> activeAttrs = danhMucThuocTinhRepository.findAll(specAttr);
        Map<Long, DanhMucThuocTinh> attrMap = activeAttrs.stream()
                .collect(Collectors.toMap(DanhMucThuocTinh::getId, a -> a));

        // Lấy danh sách các giá trị thuộc tính hiện tại đang có trong DB cho tài sản này
        List<GiaTriThuocTinh> existingValues = giaTriThuocTinhRepository
                .findByIdDonViAndLoaiTaiSanAndIdTaiSanAndThoiGianXoaIsNull(idDonVi, request.getLoaiTaiSan(), request.getIdTaiSan());
        Map<Long, GiaTriThuocTinh> existingValMap = existingValues.stream()
                .collect(Collectors.toMap(v -> v.getDanhMucThuocTinh().getId(), v -> v));

        List<GiaTriThuocTinh> entitiesToSave = new ArrayList<>();

        // 2. Xử lý từng giá trị trong request
        for (GiaTriThuocTinhBulkSaveRequest.AttributeValueItem item : requestValues) {
            DanhMucThuocTinh attr = attrMap.get(item.getDanhMucThuocTinhId());
            if (attr == null) {
                // Thử tìm trong DB đề phòng thuộc tính bị khóa nhưng client vẫn gửi lên
                DanhMucThuocTinh dbAttr = danhMucThuocTinhRepository.findByIdAndThoiGianXoaIsNull(item.getDanhMucThuocTinhId())
                        .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục thuộc tính với ID: " + item.getDanhMucThuocTinhId(), 404));
                if (!dbAttr.getTrangThai().equals("HOAT_DONG")) {
                    throw new NghiepVuException("Thuộc tính '" + dbAttr.getTenThuocTinh() + "' hiện đang bị khóa", 400);
                }
                if (!dbAttr.getApDungCho().equalsIgnoreCase(request.getLoaiTaiSan())) {
                    throw new NghiepVuException("Thuộc tính '" + dbAttr.getTenThuocTinh() + "' không áp dụng cho loại tài sản " + request.getLoaiTaiSan(), 400);
                }
                attr = dbAttr;
            }

            // Tìm entity cũ để cập nhật hoặc tạo mới
            GiaTriThuocTinh entity = existingValMap.get(item.getDanhMucThuocTinhId());
            if (entity == null) {
                entity = new GiaTriThuocTinh();
                entity.setIdDonVi(idDonVi);
                entity.setLoaiTaiSan(request.getLoaiTaiSan());
                entity.setIdTaiSan(request.getIdTaiSan());
                entity.setDanhMucThuocTinh(attr);
            }

            // Logic nhập liệu Chọn Option + Nhập Tay
            if (item.getLuaChonId() != null) {
                LuaChonGoiY option = luaChonGoiYRepository.findByIdAndThoiGianXoaIsNull(item.getLuaChonId())
                        .orElseThrow(() -> new NghiepVuException("Không tìm thấy lựa chọn gợi ý với ID: " + item.getLuaChonId(), 404));
                
                if (!option.getDanhMucThuocTinh().getId().equals(attr.getId())) {
                    throw new NghiepVuException("Lựa chọn gợi ý '" + option.getGiaTri() + "' không thuộc thuộc tính '" + attr.getTenThuocTinh() + "'", 400);
                }
                if (!"HOAT_DONG".equals(option.getTrangThai())) {
                    throw new NghiepVuException("Lựa chọn gợi ý '" + option.getGiaTri() + "' hiện đang bị khóa", 400);
                }

                String optVal = option.getGiaTri().trim();
                if (optVal.equalsIgnoreCase("Khác...") || optVal.equalsIgnoreCase("Khác")) {
                    // Phải có giá trị nhập tay
                    if (item.getGiaTri() == null || item.getGiaTri().trim().isEmpty()) {
                        throw new NghiepVuException("Bạn đã chọn tùy chọn '" + optVal + "', vui lòng nhập giá trị chi tiết vào ô dữ liệu", 400);
                    }
                    entity.setLuaChon(option);
                    entity.setGiaTri(item.getGiaTri().trim());
                } else {
                    // Chọn option thường -> force giá trị nhập tay thành null
                    entity.setLuaChon(option);
                    entity.setGiaTri(null);
                }
            } else {
                // Nhập tay hoàn toàn
                entity.setLuaChon(null);
                if (attr.getBatBuocNhap() && (item.getGiaTri() == null || item.getGiaTri().trim().isEmpty())) {
                    throw new NghiepVuException("Giá trị thuộc tính '" + attr.getTenThuocTinh() + "' là bắt buộc nhập", 400);
                }
                entity.setGiaTri(item.getGiaTri() != null ? item.getGiaTri().trim() : null);
            }

            entitiesToSave.add(entity);
        }

        // 3. Kiểm tra ràng buộc bắt buộc nhập đối với các thuộc tính bắt buộc của loại tài sản này
        // (Bao gồm những thuộc tính bắt buộc chưa được gửi lên trong request nhưng hiện tại cũng không có trong DB)
        Set<Long> processedAttrIds = requestValues.stream()
                .map(GiaTriThuocTinhBulkSaveRequest.AttributeValueItem::getDanhMucThuocTinhId)
                .collect(Collectors.toSet());

        for (DanhMucThuocTinh reqAttr : activeAttrs) {
            if (reqAttr.getBatBuocNhap() && !processedAttrIds.contains(reqAttr.getId())) {
                // Nếu chưa được xử lý trong request này, kiểm tra xem đã tồn tại trong DB trước đó chưa
                GiaTriThuocTinh dbVal = existingValMap.get(reqAttr.getId());
                if (dbVal == null || (dbVal.getLuaChon() == null && (dbVal.getGiaTri() == null || dbVal.getGiaTri().trim().isEmpty()))) {
                    throw new NghiepVuException("Vui lòng cấu hình thuộc tính bắt buộc: " + reqAttr.getTenThuocTinh(), 400);
                }
            }
        }

        // 4. Thực hiện lưu vào DB
        List<GiaTriThuocTinh> savedEntities = giaTriThuocTinhRepository.saveAll(entitiesToSave);

        return savedEntities.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private GiaTriThuocTinhResponse mapToResponse(GiaTriThuocTinh ent) {
        return GiaTriThuocTinhResponse.builder()
                .id(ent.getId())
                .idDonVi(ent.getIdDonVi())
                .danhMucThuocTinhId(ent.getDanhMucThuocTinh().getId())
                .danhMucThuocTinhTen(ent.getDanhMucThuocTinh().getTenThuocTinh())
                .danhMucThuocTinhMa(ent.getDanhMucThuocTinh().getMaThuocTinh())
                .luaChonId(ent.getLuaChon() != null ? ent.getLuaChon().getId() : null)
                .luaChonGiaTri(ent.getLuaChon() != null ? ent.getLuaChon().getGiaTri() : null)
                .loaiTaiSan(ent.getLoaiTaiSan())
                .idTaiSan(ent.getIdTaiSan())
                .giaTri(ent.getGiaTri())
                .thoiGianTao(ent.getThoiGianTao())
                .thoiGianCapNhat(ent.getThoiGianCapNhat())
                .build();
    }
}
