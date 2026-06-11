package com.example.backend.modules.auth.service;

import com.example.backend.modules.auth.service.interfaces.XacThucService;

import com.example.backend.modules.auth.dto.XacThucResponse;
import com.example.backend.modules.auth.dto.DangNhapRequest;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.model.PhienDangNhap;
import com.example.backend.modules.auth.repository.PhienDangNhapRepository;
import com.example.backend.modules.auth.security.NguoiDungUserDetails;
import com.example.backend.modules.auth.security.JwtTokenProvider;
import com.example.backend.shared.exception.NghiepVuException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import com.example.backend.modules.auth.event.DangNhapEvent;

@Service
@RequiredArgsConstructor
public class XacThucServiceImpl implements XacThucService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final PhienDangNhapRepository phienDangNhapRepository;
    private final ApplicationEventPublisher eventPublisher;

    public XacThucResponse login(DangNhapRequest request, HttpServletRequest httpRequest) {
        try {
            // Xóac thực mật khẩu qua AuthenticationManager (Mặc định dùng BCrypt)
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            // Sinh Token
            NguoiDungUserDetails userDetails = (NguoiDungUserDetails) authentication.getPrincipal();
            String accessToken = tokenProvider.generateAccessToken(userDetails);
            String refreshToken = tokenProvider.generateRefreshToken(userDetails);

            NguoiDung nguoiDung = userDetails.getNguoiDung();

            // Ghi nhận Phiên ?ăng Nhập
            PhienDangNhap phien = new PhienDangNhap();
            phien.setNguoiDung(nguoiDung);
            phien.setIdDonVi(nguoiDung.getIdDonVi());
            phien.setTokenTruyCap(accessToken);
            phien.setTokenLamMoi(refreshToken);
            phien.setDiaChiIp(httpRequest.getRemoteAddr());
            phien.setTrinhDuyet(httpRequest.getHeader("User-Agent"));
            phien.setTrangThai("HOAT_DONG");
            phien.setThoiGianHetHan(LocalDateTime.now().plusDays(30)); // Refresh Token sống 30 ngày
            phienDangNhapRepository.save(phien);

            // Trách xuất danh sựch QuyẤn để nợm v? Frontend (Mã quyẤn Tiếng Việt như XEM_TAI_SAN)
            List<String> permissions = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            // Phệt sự kiện đăng nhập thểnh cóng
            eventPublisher.publishEvent(new DangNhapEvent(
                    nguoiDung, request.getUsername(), "THANH_CONG", 
                    httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent")
            ));

            return XacThucResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .idDonVi(nguoiDung.getIdDonVi())
                    .username(nguoiDung.getTenDangNhap())
                    .permissions(permissions)
                    .build();

        } catch (Exception e) {
            // Phệt sự kiện đăng nhập thất bại
            eventPublisher.publishEvent(new DangNhapEvent(
                    null, request.getUsername(), "THAT_BAI", 
                    httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent")
            ));
            // Nếu sai từi khoản hoặc mật khẩu, bắn lỗi theo chuẩn chung
            throw new NghiepVuException("Từn đăng nhập hoặc mật khẩu kháng chỉnh xãc", 401);
        }
    }
}

