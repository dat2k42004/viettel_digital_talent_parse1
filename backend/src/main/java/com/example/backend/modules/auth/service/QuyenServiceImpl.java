package com.example.backend.modules.auth.service;

import com.example.backend.modules.auth.service.interfaces.QuyenService;

import com.example.backend.modules.auth.dto.QuyenResponse;
import com.example.backend.modules.auth.model.Quyen;
import com.example.backend.modules.auth.repository.QuyenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.Cacheable;

@Service
@RequiredArgsConstructor
public class QuyenServiceImpl implements QuyenService {

    private final QuyenRepository quyenRepository;

    @Override
    @Cacheable(value = "global_permissions", key = "'all'", unless = "#result == null")
    public List<QuyenResponse> layDanhSachQuyen() {
        return quyenRepository.findAll().stream()
                .filter(q -> q.getThoiGianXoa() == null) // Bỏ qua quyền đã xóa
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "global_permissions_grouped", key = "'all'", unless = "#result == null")
    public Map<String, List<QuyenResponse>> layDanhSachQuyenPhanNhom() {
        List<Quyen> activePermissions = quyenRepository.findByThoiGianXoaIsNull();
        return activePermissions.stream()
                .filter(q -> "HOAT_DONG".equals(q.getTrangThai())) // Lọc chỉ quyền đang hoạt động
                .collect(Collectors.groupingBy(
                        q -> extractModule(q.getMaQuyen()),
                        Collectors.mapping(this::mapToResponse, Collectors.toList())
                ));
    }

    private String extractModule(String maQuyen) {
        if (maQuyen == null) return "OTHERS";
        if (maQuyen.contains("NGUOI_DUNG")) return "NGUOI_DUNG";
        if (maQuyen.contains("VAI_TRO")) return "VAI_TRO";
        if (maQuyen.contains("DON_VI")) return "DON_VI";
        if (maQuyen.contains("PHONG_BAN")) return "PHONG_BAN";
        if (maQuyen.contains("VI_TRI")) return "VI_TRI";
        if (maQuyen.contains("CAU_HINH")) return "CAU_HINH";
        if (maQuyen.contains("QUYEN")) return "QUYEN";
        return "OTHERS";
    }

    private QuyenResponse mapToResponse(Quyen quyen) {
        return QuyenResponse.builder()
                .id(quyen.getId())
                .maQuyen(quyen.getMaQuyen())
                .tenQuyen(quyen.getTenQuyen())
                .build();
    }
}
