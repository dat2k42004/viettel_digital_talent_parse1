package com.example.backend.shared.service;

import com.example.backend.shared.dto.NhatKyThaoTacHeThongResponse;
import com.example.backend.shared.model.NhatKyThaoTacHeThong;
import com.example.backend.shared.repository.NhatKyThaoTacHeThongRepository;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.service.interfaces.NhatKyThaoTacHeThongService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NhatKyThaoTacHeThongServiceImpl implements NhatKyThaoTacHeThongService {

    private final NhatKyThaoTacHeThongRepository repository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NhatKyThaoTacHeThongResponse> layDanhSach(
            Long idTaiKhoanThaoTac,
            String phuongThucApi,
            String thucTheTacDong,
            LocalDateTime tuNgay,
            LocalDateTime denNgay,
            int page,
            int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "thoiGianThaoTac"));

        Specification<NhatKyThaoTacHeThong> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (idTaiKhoanThaoTac != null) {
                predicates.add(cb.equal(root.get("idTaiKhoanThaoTac"), idTaiKhoanThaoTac));
            }
            if (phuongThucApi != null && !phuongThucApi.trim().isEmpty()) {
                predicates.add(cb.equal(cb.upper(root.get("phuongThucApi")), phuongThucApi.trim().toUpperCase()));
            }
            if (thucTheTacDong != null && !thucTheTacDong.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("thucTheTacDong")), "%" + thucTheTacDong.trim().toLowerCase() + "%"));
            }
            if (tuNgay != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianThaoTac"), tuNgay));
            }
            if (denNgay != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianThaoTac"), denNgay));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<NhatKyThaoTacHeThong> pageData = repository.findAll(spec, pageRequest);
        Page<NhatKyThaoTacHeThongResponse> responsePage = pageData.map(this::mapToResponse);

        return PageResponse.from(responsePage);
    }

    private NhatKyThaoTacHeThongResponse mapToResponse(NhatKyThaoTacHeThong entity) {
        return NhatKyThaoTacHeThongResponse.builder()
                .id(entity.getId())
                .idTaiKhoanThaoTac(entity.getIdTaiKhoanThaoTac())
                .phuongThucApi(entity.getPhuongThucApi())
                .endpointApi(entity.getEndpointApi())
                .thucTheTacDong(entity.getThucTheTacDong())
                .idBanGhi(entity.getIdBanGhi())
                .duLieuTruoc(entity.getDuLieuTruoc())
                .duLieuSau(entity.getDuLieuSau())
                .diaChiIp(entity.getDiaChiIp())
                .thoiGianThaoTac(entity.getThoiGianThaoTac())
                .build();
    }
}
