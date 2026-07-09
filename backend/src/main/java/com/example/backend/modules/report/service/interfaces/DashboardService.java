package com.example.backend.modules.report.service.interfaces;

import com.example.backend.modules.report.dto.ThongKeTongQuanDashboardResponse;
import java.util.Map;

public interface DashboardService {

     ThongKeTongQuanDashboardResponse layThongKeDonViAdmin(Long idDonVi);

     Map<String, Object> layThongKeToanSanSuperAdmin();
}