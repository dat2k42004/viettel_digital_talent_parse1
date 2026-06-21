package com.example.backend.modules.auth.security;

import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.shared.model.TrangThaiCoBanEnum;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@Getter
@AllArgsConstructor
public class NguoiDungUserDetails implements UserDetails {
    private final NguoiDung nguoiDung;
    private final Collection<? extends GrantedAuthority> authorities;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return nguoiDung.getMatKhau();
    }

    @Override
    public String getUsername() {
        return nguoiDung.getTenDangNhap();
    }

    public Long getIdDonVi() {
        return nguoiDung.getIdDonVi();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return nguoiDung.getTrangThai() != TrangThaiCoBanEnum.KHOA;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return nguoiDung.getTrangThai() == TrangThaiCoBanEnum.HOAT_DONG;
    }
}
