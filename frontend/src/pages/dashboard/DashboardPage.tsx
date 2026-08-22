import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Tag, Empty, Spin, message, Select } from 'antd';
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
import { layDanhSach29 as layDanhSachDonVi } from '../../api-generated/endpoints/don-vi-controller/don-vi-controller';
import type { ThongKeTongQuanDashboardResponse } from '../../api-generated/models/thongKeTongQuanDashboardResponse';

const { Title, Paragraph, Text } = Typography;

export const DashboardPage: React.FC = observer(() => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  
  // State thống kê Tenant (Admin Đơn vị)
  const [thongKeDonVi, setThongKeDonVi] = useState<ThongKeTongQuanDashboardResponse | null>(null);
  
  // State thống kê Toàn sản (SuperAdmin)
  const [thongKeToanSan, setThongKeToanSan] = useState<any>(null);

  // Thêm state cho việc chọn đơn vị của Super Admin
  const [donViList, setDonViList] = useState<any[]>([]);
  const [selectedDonViId, setSelectedDonViId] = useState<number | undefined>(undefined);

  // Tải danh sách đơn vị nếu là Super Admin
  useEffect(() => {
    if (authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN)) {
      layDanhSachDonVi({ page: 0, size: 1000 })
        .then((res) => {
          if (res && res.data && res.data.content) {
            setDonViList(res.data.content);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Tải thống kê cho đơn vị cụ thể khi Super Admin chọn đơn vị
  useEffect(() => {
    const taiThongKeDonVi = async () => {
      if (selectedDonViId) {
        setLoading(true);
        try {
          const res = await layThongKeDonViAdmin({ idDonVi: selectedDonViId });
          if (res && res.data) {
            setThongKeDonVi(res.data);
          }
        } catch (error: any) {
          message.error(error?.message || t('dashboardPage.khong_the_tai_du'));
        } finally {
          setLoading(false);
        }
      } else {
        // Nếu không chọn hoặc chọn lại Tất cả đơn vị
        if (authStore.kiemTraQuyen(QUYEN.XEM_BAO_CAO) && !authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN)) {
          // Admin đơn vị thường
          setLoading(true);
          try {
            const res = await layThongKeDonViAdmin();
            if (res && res.data) {
              setThongKeDonVi(res.data);
            }
          } catch (error: any) {
            message.error(error?.message || t('dashboardPage.khong_the_tai_du'));
          } finally {
            setLoading(false);
          }
        } else {
          setThongKeDonVi(null);
        }
      }
    };

    taiThongKeDonVi();
  }, [selectedDonViId]);

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
        
        if (authStore.kiemTraQuyen(QUYEN.XEM_BAO_CAO) && !authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN)) {
          const res = await layThongKeDonViAdmin();
          if (res && res.data) {
            setThongKeDonVi(res.data);
          }
        }
      } catch (error: any) {
        message.error(error?.message || t('dashboardPage.khong_the_tai_du'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip={t('dashboardPage.dang_tai_du_lieu')} />
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
        name: key === 'SAN_SANG' ? t('dashboardPage.san_sang') : key === 'DANG_CAP_PHAT' ? t('dashboardPage.dang_cap_phat') : key === 'BAO_TRI' ? t('dashboardPage.bao_tri') : key === 'HONG' ? t('dashboardPage.hong') : key,
        value: Number(val),
        originalKey: key
      }))
    : [];

  const barData = thongKeDonVi?.bieuDoPhanBoPhongBan
    ? Object.entries(thongKeDonVi.bieuDoPhanBoPhongBan).map(([key, val]) => ({
        name: key,
        [t('donHangMuaSamFormModal.so_luong')]: Number(val)
      }))
    : [];

  // --- XỬ LÝ DỮ LIỆU BIỂU ĐỒ TOÀN SẢN (SUPER ADMIN) ---
  const tenantBarData = thongKeToanSan?.bieuDoSoSanhTenant
    ? Object.entries(thongKeToanSan.bieuDoSoSanhTenant).map(([key, val]) => ({
        name: key,
        [t('dashboardPage.cap_phat')]: Number(val)
      }))
    : [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>{t('dashboardPage.tong_quan_he_thong')}</Title>
        <Paragraph type="secondary">
          {t('dashboardPage.thong_ke_hien_tai_cho_tai_khoan')} <strong>{authStore.tenNguoiDung}</strong>{authStore.maDonVi ? ` | ${t('dashboardPage.don_vi_id', { id: authStore.maDonVi })}` : ''}
        </Paragraph>
      </div>

      {/* Bộ chọn Đơn vị dành cho Super Admin */}
      {authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN) && (
        <Card style={{ marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
          <Row align="middle" gutter={[16, 8]}>
            <Col xs={24} sm="auto">
              <Text strong>{t('dashboardPage.chon_don_vi_xem')}</Text>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder={t('dashboardPage.hien_thi_tong_hop')}
                allowClear
                style={{ width: '100%' }}
                value={selectedDonViId}
                onChange={(value) => setSelectedDonViId(value)}
                options={donViList.map((dv) => ({
                  value: dv.id,
                  label: dv.tenThuongMai || dv.tenDangKy || `Đơn vị #${dv.id}`
                }))}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* ====================================================================== */}
      {/* 1. GIAO DIỆN DÀNH CHO SUPER ADMIN (QUẢN TRỊ TOÀN SẢN)                  */}
      {/* ====================================================================== */}
      {authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN) && thongKeToanSan && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <Tag color="purple" style={{ fontSize: 13, padding: '4px 8px' }}>{t('dashboardPage.giao_dien_quan_tri')}</Tag>
          </div>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title={t('dashboardPage.tong_so_don_vi')}
                  value={thongKeToanSan.tongTenantDonVi || 0}
                  prefix={<BankOutlined style={{ color: '#13c2c2' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title={t('phieuSuaChuaFormModal.thiet_bi_phan_cung')}
                  value={thongKeToanSan.tongTaiSanPhanCung || 0}
                  prefix={<LaptopOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title={t('phieuThanhLyFormModal.linh_kien_roi')}
                  value={thongKeToanSan.tongTaiSanLinhKien || 0}
                  prefix={<BuildOutlined style={{ color: '#9254de' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title={t('phieuThanhLyFormModal.ban_quyen_phan_mem')}
                  value={thongKeToanSan.tongTaiSanPhanMem || 0}
                  prefix={<SafetyCertificateOutlined style={{ color: '#fa8c16' }} />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card title={t('dashboardPage.so_sanh_quy_mo')} bordered={false} style={{ borderRadius: 8 }}>
                {tenantBarData.length > 0 ? (
                  <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <BarChart data={tenantBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip formatter={(value) => t('dashboardPage.number_value_0_tolocalestring_vi', { toLocaleStringviVN: Number(value || 0).toLocaleString('vi-VN') })} />
                        <Legend />
                        <Bar dataKey={t('dashboardPage.cap_phat')} fill="#1890ff" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Empty description={t('dashboardPage.khong_co_du_lieu_so_sanh_don_vi')} />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 2. GIAO DIỆN DÀNH CHO ADMIN ĐƠN VỊ (XEM BÁO CÁO CHI TIẾT)             */}
      {/* ====================================================================== */}
      {thongKeDonVi ? (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Tag color="blue" style={{ fontSize: 13, padding: '4px 8px' }}>{t('dashboardPage.bao_cao_tong_quan')}</Tag>
          </div>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title={t('dashboardPage.tong_so_thiet_bi')}
                  value={thongKeDonVi.tongSoLuongThietBi || 0}
                  prefix={<LaptopOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title={t('dashboardPage.yeu_cau_cap_phat')}
                  value={thongKeDonVi.soLuongYeuCauCapPhatChoDuyet || 0}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title={t('dashboardPage.bao_hong_cho_duyet')}
                  value={thongKeDonVi.soLuongYeuCauBaoHongChoDuyet || 0}
                  prefix={<AlertOutlined style={{ color: '#faad14' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <Statistic
                  title={t('dashboardPage.tong_gia_tri_uoc')}
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
              <Card title={t('dashboardPage.ty_le_trang_thai')} bordered={false} style={{ borderRadius: 8 }}>
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
                        <ChartTooltip formatter={(value) => t('dashboardPage.value_thiet_bi', { value: value })} />
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
                  <Empty description={t('dashboardPage.khong_co_du_lieu')} />
                )}
              </Card>
            </Col>

            {/* Biểu đồ cột phòng ban */}
            <Col xs={24} md={14}>
              <Card title={t('dashboardPage.phan_bo_thiet_bi')} bordered={false} style={{ borderRadius: 8 }}>
                {barData.length > 0 ? (
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip formatter={(value) => t('dashboardPage.value_thiet_bi', { value: value })} />
                        <Bar dataKey={t('donHangMuaSamFormModal.so_luong')} fill="#1890ff" radius={[4, 4, 0, 0]} barSize={35} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Empty description={t('dashboardPage.chua_co_du_lieu')} />
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
                      <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>{t('dashboardPage.chao_mung_ban_den')}</Text>
                      <Text type="secondary">{t('dashboardPage.tai_khoan_cua_ban')}<strong>XEM_BAO_CAO</strong>{t('dashboardPage.de_hien_thi_phan')}</Text>
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
