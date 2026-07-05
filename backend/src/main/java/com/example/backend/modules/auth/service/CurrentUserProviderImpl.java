package com.example.backend.modules.auth.service;

import com.example.backend.modules.auth.security.NguoiDungUserDetails;
import com.example.backend.shared.service.interfaces.CurrentUserProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserProviderImpl implements CurrentUserProvider {

    @Override
    public Long getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof NguoiDungUserDetails userDetails) {
                return userDetails.getNguoiDung().getId();
            }
        } catch (Exception e) {
            // No authentication context
        }
        return null;
    }
}
