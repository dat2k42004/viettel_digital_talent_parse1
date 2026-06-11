package com.example.backend.modules.tenant.service.interfaces;

import com.example.backend.modules.tenant.dto.DangKyDonViRequest;
import com.example.backend.modules.tenant.dto.XacThucOtpRequest;

public interface DonViService {
    void dangKyDonVi(DangKyDonViRequest request);
    void xacThucOtp(XacThucOtpRequest request);
}

