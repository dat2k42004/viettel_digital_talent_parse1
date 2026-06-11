package com.example.backend.modules.auth.service;

import com.example.backend.modules.auth.service.interfaces.NguoiDungService;

import com.example.backend.modules.auth.dto.NguoiDungRequest;
import com.example.backend.modules.auth.dto.NguoiDungResponse;
import com.example.backend.modules.auth.dto.VaiTroResponse;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.model.NguoiDungVaiTro;
import com.example.backend.modules.auth.model.VaiTro;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.repository.NguoiDungVaiTroRepository;
import com.example.backend.modules.auth.repository.VaiTroRepository;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.tenant.DonViContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NguoiDungServiceImpl implements NguoiDungService {

    private final NguoiDungRepository nguoiDungRepository;
    private final NguoiDungVaiTroRepository nguoiDungVaiTroRepository;
    private final VaiTroRepository vaiTroRepository;
    private final PasswordEncoder passwordEncoder;

    public List<NguoiDungResponse> layDanhSach() {
        Long idDonVi = DonViContextHolder.getTenantId();
        List<NguoiDung> danhSach;
        if (idDonVi == null) {
            danhSach = nguoiDungRepository.findByIdDonViIsNullAndThoiGianXoaIsNull();
        } else {
            danhSach = nguoiDungRepository.findByIdDonViAndThoiGianXoaIsNull(idDonVi);
        }
        return danhSach.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public NguoiDungResponse themMoi(NguoiDungRequest request) {
        if (nguoiDungRepository.existsByTenDangNhapAndThoiGianXoaIsNull(request.getTenDangNhap())) {
            throw new NghiepVuException("Từn đăng nhập đã tồn tại", 400);
        }
        if (StringUtils.hasText(request.getEmail()) && nguoiDungRepository.existsByEmailAndThoiGianXoaIsNull(request.getEmail())) {
            throw new NghiepVuException("Email đã được sử dụng", 400);
        }
        if (!StringUtils.hasText(request.getMatKhau())) {
            throw new NghiepVuException("Mật khẩu kháng được để trống khi tạo mới", 400);
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

        return mapToResponse(nguoiDung);
    }

    @Transactional
    public NguoiDungResponse capNhat(Long id, NguoiDungRequest request) {
        NguoiDung nguoiDung = kiemTraTonTaiVaQuyen(id);

        if (!nguoiDung.getTenDangNhap().equals(request.getTenDangNhap()) && 
            nguoiDungRepository.existsByTenDangNhapAndThoiGianXoaIsNull(request.getTenDangNhap())) {
            throw new NghiepVuException("Từn đăng nhập đã tồn tại", 400);
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
        nguoiDung.setTrangThai(StringUtils.hasText(request.getTrangThai()) ? request.getTrangThai() : nguoiDung.getTrangThai());

        nguoiDung = nguoiDungRepository.save(nguoiDung);

        capNhatVaiTroChoNguoiDung(nguoiDung, request.getDanhSachIdVaiTro());

        return mapToResponse(nguoiDung);
    }

    @Transactional
    public void xoaMem(Long id) {
        NguoiDung nguoiDung = kiemTraTonTaiVaQuyen(id);
        nguoiDung.setThoiGianXoa(LocalDateTime.now());
        nguoiDung.setLyDoXoa("Xóaa từi khoản");
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
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy ngưĐi dùng", 404));
        Long idDonVi = DonViContextHolder.getTenantId();
        if ((idDonVi == null && nguoiDung.getIdDonVi() != null) ||
            (idDonVi != null && !idDonVi.equals(nguoiDung.getIdDonVi()))) {
            throw new NghiepVuException("Bạn kháng có quyẤn thao từc trản ngưĐi dùng này", 403);
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
                .build();
    }
}

