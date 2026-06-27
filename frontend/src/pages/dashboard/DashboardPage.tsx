import React from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag } from 'antd';
import { LaptopOutlined, CheckCircleOutlined, AlertOutlined, DollarOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { authStore, QUYEN } from '../../stores/AuthStore';

const { Title, Paragraph } = Typography;

export const DashboardPage: React.FC = observer(() => {
  const tongTaiSan = 1520;
  const soThietBiCapPhat = 980;
  const soLuongYeuCauDuyet = 14;
  const tongGiaTriTaiSan = 12500000000; // 12.5 Tỷ VND

  const columnsGiaLap = [
    { title: 'Phong ban', dataIndex: 'phongBan', key: 'phongBan' },
    { title: 'So luong thiet bi', dataIndex: 'soLuong', key: 'soLuong' },
    { title: 'Trang thai', dataIndex: 'trangThai', key: 'trangThai', render: (val: string) => <Tag color="green">{val}</Tag> },
  ];

  const dataGiaLap = [
    { key: 1, phongBan: 'Phòng Công nghệ Thông tin (IT)', soLuong: 120, trangThai: 'HOAT_DONG' },
    { key: 2, phongBan: 'Phòng Nhân sự (HR)', soLuong: 45, trangThai: 'HOAT_DONG' },
    { key: 3, phongBan: 'Phòng Tài chính (Finance)', soLuong: 30, trangThai: 'HOAT_DONG' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Tổng quan hệ thống</Title>
        <Paragraph type="secondary">
          Thống kê hiện tại cho đơn vị ID: <strong>{authStore.maDonVi}</strong> với quyền hạn tương ứng.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Tổng số tài sản"
              value={tongTaiSan}
              prefix={<LaptopOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Đang cấp phát"
              value={soThietBiCapPhat}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Yêu cầu chờ duyệt"
              value={soLuongYeuCauDuyet}
              prefix={<AlertOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Tổng giá trị ước tính (VND)"
              value={tongGiaTriTaiSan}
              formatter={(value) => `${Number(value).toLocaleString('vi-VN')}`}
              prefix={<DollarOutlined style={{ color: '#eb2f96' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Phân bổ tài sản phần cứng theo đơn vị nội bộ" bordered={false}>
            {authStore.kiemTraQuyen(QUYEN.XEM_BAO_CAO) ? (
              <Table
                dataSource={dataGiaLap}
                columns={columnsGiaLap}
                pagination={false}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
                Bạn không có quyền <strong>XEM_BAO_CAO</strong> để hiển thị phân bổ dữ liệu vĩ mô.
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
});

export default DashboardPage;
