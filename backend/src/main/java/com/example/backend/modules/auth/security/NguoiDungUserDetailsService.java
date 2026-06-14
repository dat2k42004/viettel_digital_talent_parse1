package com.example.backend.modules.auth.security;

import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.service.interfaces.NguoiDungService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NguoiDungUserDetailsService implements UserDetailsService {

    private final NguoiDungRepository nguoiDungRepository;
    private final NguoiDungService nguoiDungService;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhapAndThoiGianXoaIsNull(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng hoặc tài khoản đã bị xóa: " + username));

        // Tự động gom toàn bộ quyền động của User này qua Cache
        List<String> quyenList = nguoiDungService.resolveAndCacheUserPermissions(nguoiDung.getId());
        List<GrantedAuthority> authorities = quyenList.stream()
                // Sử dụng mã quyền (Ví dụ: XEM_TAI_SAN) làm GrantedAuthority
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        return new NguoiDungUserDetails(nguoiDung, authorities);
    }
}
