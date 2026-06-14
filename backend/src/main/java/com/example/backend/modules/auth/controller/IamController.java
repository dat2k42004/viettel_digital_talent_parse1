package com.example.backend.modules.auth.controller;

import com.example.backend.modules.auth.security.NguoiDungUserDetails;
import com.example.backend.shared.response.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/iam")
public class IamController {

    @GetMapping("/my-permissions")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<String>> getMyPermissions() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof NguoiDungUserDetails userDetails) {
            List<String> permissions = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
            return ApiResponse.success(permissions);
        }
        return ApiResponse.success(List.of());
    }
}
