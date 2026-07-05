import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Tag, Empty, Spin, message } from 'antd';
import {
  LaptopOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  DollarOutlined,
  BankOutlined,
  BuildOutlined,
  SafetyCertificateOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend } from 'recharts';
import { authStore, QUYEN } from '../../stores/AuthStore';
import { layThongKeDonViAdmin, layThongKeToanSanSuperAdmin } from '../../api-generated/endpoints/dashboard-controller/dashboard-controller';
import type { ThongKeTongQuanDashboardResponse } from '../../api-generated/models/thongKeTongQuanDashboardResponse';

const { Title, Paragraph, Text } = Typography;

export const DashboardPage: React.FC = observer(() => {
  const [loading, setLoading] = useState<boolean>(true);
  
  // State thống kê Tenant (Admin Đơn vị)
  const [thongKeDonVi, setThongKeDonVi] = useState<ThongKeTongQuanDashboardResponse | null>(null);
  
  // State thống kê Toàn sản (SuperAdmin)
  const [thongKeToanSan, setThongKeToanSan] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN)) {
          const res = await layThongKeToanSanSuperAdmin();
          if (res && res.data) {
            setThongKeToanSan(res.data);
          }
        }
        
        if (authStore.kiemTraQuyen(QUYEN.XEM_BAO_CAO)) {
          const res = await layThongKeDonViAdmin();
          if (res && res.data) {
            setThongKeDonVi(res.data);
          }
        }
      } catch (error: any) {
        message.error(error?.message || 'Không thể tải dữ liệu thống kê tổng quan!');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Đang tải dữ liệu tổng quan thống kê..." />
      </div>
    );
  }

  // --- MÀU SẮC ĐỒ HỌA CHUYÊN NGHIỆP ---
  const COLORS_STATUS: Record<string, string> = {
    'SAN_SANG': '#52c41a',      // Xanh lá
    'DANG_CAP_PHAT': '#1890ff',  // Xanh dương
    'BAO_TRI': '#faad14',        // Cam
    'HONG': '#f5222d',           // Đỏ
  };

  const THEME_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c'];

  // --- XỬ LÝ DỮ LIỆU BIỂU ĐỒ TENANT (ADMIN ĐƠN VỊ) ---
  const pieData = thongKeDonVi?.bieuDoTyLeTrangThai
    ? Object.entries(thongKeDonVi.bieuDoTyLeTrangThai).map(([key, val]) => ({
        name: key === 'SAN_SANG' ? 'Sẵn sàng' : key === 'DANG_CAP_PHAT' ? 'Đang cấp phát' : key === 'BAO_TRI' ? 'Bảo trì' : key === 'HONG' ? 'Hỏng' : key,
        value: Number(val),
        originalKey: key
      }))
    : [];

  const barData = thongKeDonVi?.bieuDoPhanBoPhongBan
    ? Object.entries(thongKeDonVi.bieuDoPhanBoPhongBan).map(([key, val]) => ({
        name: key,
        'Số lượng': Number(val)
      }))
    : [];

  // --- XỬ LÝ DỮ LIỆU BIỂU ĐỒ TOÀN SẢN (SUPER ADMIN) ---
  const tenantBarData = thongKeToanSan?.bieuDoSoSanhTenant
    ? Object.entries(thongKeToanSan.bieuDoSoSanhTenant).map(([key, val]) => ({
        name: key,
        'Cấp phát': Number(val)
      }))
    : [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Tổng quan hệ thống ITAM</Title>
        <Paragraph type="secondary">
          Thống kê hiện tại cho tài khoản: <strong>{authStore.tenNguoiDung}</strong> {authStore.maDonVi ? `| Đơn vị ID: ${authStore.maDonVi}` : ''}
        </Paragraph>
      </div>

      {/* ====================================================================== */}
      {/* 1. GIAO DIỆN DÀNH CHO SUPER ADMIN (QUẢN TRỊ TOÀN SẢN)                  */}
      {/* ====================================================================== */}
      {authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN) && thongKeToanSan && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <Tag color="purple" style={{ fontSize: 13, padding: '4px 8px' }}>Giao diện Quản trị toàn hệ thống (Super Admin)</Tag>
          </div>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title="Tổng số Đơn vị (Tenant)"
                  value={thongKeToanSan.tongTenantDonVi || 0}
                  prefix={<BankOutlined style={{ color: '#13c2c2' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title="Thiết bị phần cứng"
                  value={thongKeToanSan.tongTaiSanPhanCung || 0}
                  prefix={<LaptopOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title="Linh kiện rời"
                  value={thongKeToanSan.tongTaiSanLinhKien || 0}
                  prefix={<BuildOutlined style={{ color: '#9254de' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title="Bản quyền phần mềm"
                  value={thongKeToanSan.tongTaiSanPhanMem || 0}
                  prefix={<SafetyCertificateOutlined style={{ color: '#fa8c16' }} />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card title="So sánh quy mô cấp phát tài sản giữa các đơn vị thành viên" bordered={false} style={{ borderRadius: 8 }}>
                {tenantBarData.length > 0 ? (
                  <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <BarChart data={tenantBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip formatter={(value) => `${Number(value || 0).toLocaleString('vi-VN')} thiết bị`} />
                        <Legend />
                        <Bar dataKey="Cấp phát" fill="#1890ff" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Empty description="Không có dữ liệu so sánh đơn vị" />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 2. GIAO DIỆN DÀNH CHO ADMIN ĐƠN VỊ (XEM BÁO CÁO CHI TIẾT)             */}
      {/* ====================================================================== */}
      {authStore.kiemTraQuyen(QUYEN.XEM_BAO_CAO) && thongKeDonVi ? (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Tag color="blue" style={{ fontSize: 13, padding: '4px 8px' }}>Báo cáo Tổng quan đơn vị</Tag>
          </div>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title="Tổng số thiết bị"
                  value={thongKeDonVi.tongSoLuongThietBi || 0}
                  prefix={<LaptopOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title="Yêu cầu cấp phát chờ duyệt"
                  value={thongKeDonVi.soLuongYeuCauCapPhatChoDuyet || 0}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title="Báo hỏng chờ duyệt"
                  value={thongKeDonVi.soLuongYeuCauBaoHongChoDuyet || 0}
                  prefix={<AlertOutlined style={{ color: '#faad14' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title="Tổng giá trị ước tính"
                  value={thongKeDonVi.tongGiaTriTaiSanVnd || 0}
                  formatter={(value) => `${Number(value || 0).toLocaleString('vi-VN')} VND`}
                  prefix={<DollarOutlined style={{ color: '#eb2f96' }} />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            {/* Biểu đồ tròn trạng thái */}
            <Col xs={24} md={10}>
              <Card title="Tỷ lệ trạng thái tài sản" bordered={false} style={{ borderRadius: 8 }}>
                {pieData.length > 0 ? (
                  <div style={{ width: '100%', height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_STATUS[entry.originalKey] || THEME_COLORS[index % THEME_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip formatter={(value) => `${value} thiết bị`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {pieData.map((entry, index) => (
                        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS_STATUS[entry.originalKey] || THEME_COLORS[index % THEME_COLORS.length] }} />
                          <Text style={{ fontSize: 12 }}>{entry.name}: <strong>{entry.value}</strong></Text>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Empty description="Không có dữ liệu trạng thái tài sản" />
                )}
              </Card>
            </Col>

            {/* Biểu đồ cột phòng ban */}
            <Col xs={24} md={14}>
              <Card title="Phân bổ thiết bị theo phòng ban" bordered={false} style={{ borderRadius: 8 }}>
                {barData.length > 0 ? (
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip formatter={(value) => `${value} thiết bị`} />
                        <Bar dataKey="Số lượng" fill="#1890ff" radius={[4, 4, 0, 0]} barSize={35} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Empty description="Chưa có dữ liệu cấp phát phòng ban" />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      ) : (
        // Hiển thị fallback nếu không có quyền xem báo cáo
        !authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN) && (
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card bordered={false} style={{ borderRadius: 8, textAlign: 'center', padding: '40px 0' }}>
                <Empty
                  image={<PieChartOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
                  description={
                    <div>
                      <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>Chào mừng bạn đến với ITAM!</Text>
                      <Text type="secondary">Tài khoản của bạn đã được xác thực thành công. Bạn không có quyền <strong>XEM_BAO_CAO</strong> để hiển thị phân bổ dữ liệu vĩ mô.</Text>
                    </div>
                  }
                />
              </Card>
            </Col>
          </Row>
        )
      )}
    </div>
  );
});

export default DashboardPage;
