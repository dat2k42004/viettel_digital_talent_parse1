import React from 'react';
import { Card, Table, Tag, Typography, Button, Space } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined } from '@ant-design/icons';
import { QuyenHanGuard } from '../../components/protected/QuyenHanGuard';
import { observer } from 'mobx-react-lite';

const { Title, Paragraph } = Typography;

interface DonViSaaS {
  key: string;
  maDonVi: string;
  tenDonVi: string;
  tenMien: string;
  ngayKichHoat: string;
  trangThai: 'HOAT_DONG' | 'DINH_CHI' | 'CHO_PHE_DUYET';
}

export const TenantPage: React.FC = observer(() => {
  const danhSachDonVi: DonViSaaS[] = [
    {
      key: '1',
      maDonVi: 'TENANT-001',
      tenDonVi: 'Tập đoàn Viễn thông Viettel',
      tenMien: 'viettel.com.vn',
      ngayKichHoat: '2026-01-10',
      trangThai: 'HOAT_DONG',
    },
    {
      key: '2',
      maDonVi: 'TENANT-002',
      tenDonVi: 'Công ty Cổ phần sữa Vinamilk',
      tenMien: 'vinamilk.com.vn',
      ngayKichHoat: '2026-03-15',
      trangThai: 'CHO_PHE_DUYET',
    },
    {
      key: '3',
      maDonVi: 'TENANT-003',
      tenDonVi: 'Ngân hàng TMCP Ngoại thương Vietcombank',
      tenMien: 'vietcombank.com.vn',
      ngayKichHoat: '2026-05-20',
      trangThai: 'DINH_CHI',
    },
  ];

  const columnsDonVi = [
    { title: 'Mã đơn vị', dataIndex: 'maDonVi', key: 'maDonVi' },
    { title: 'Tên đơn vị', dataIndex: 'tenDonVi', key: 'tenDonVi' },
    { title: 'Tên miền domain', dataIndex: 'tenMien', key: 'tenMien' },
    { title: 'Ngày kích hoạt', dataIndex: 'ngayKichHoat', key: 'ngayKichHoat' },
    {
      title: 'Trạng thái sàn',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (val: string) => {
        const colors: Record<string, string> = {
          HOAT_DONG: 'green',
          CHO_PHE_DUYET: 'orange',
          DINH_CHI: 'red',
        };
        return <Tag color={colors[val] || 'default'}>{val}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'hanhDong',
      render: () => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>Cấu hình</Button>
          <Button size="small" type="primary" danger icon={<SafetyOutlined />}>Đình chỉ</Button>
        </Space>
      ),
    },
  ];

  return (
    <QuyenHanGuard
      quyenYeuCau="XEM_QUAN_TRI_TOAN_SAN"
      fallback={
        <Card style={{ textAlign: 'center', padding: 48 }}>
          <Title level={4} type="danger">Truy cập bị từ chối</Title>
          <Paragraph>
            Bạn không có quyền hạn <strong>XEM_QUAN_TRI_TOAN_SAN</strong> (Super Admin) để xem bảng điều khiển Đơn vị.
          </Paragraph>
        </Card>
      }
    >
      <div>
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>Quản trị Đơn vị đa doanh nghiệp (SaaS Tenants)</Title>
          <Paragraph type="secondary">
            Thiết lập danh sách tenant, cấp phát tài nguyên, kích hoạt hoặc khóa tài khoản cấp độ Tập đoàn trên sàn.
          </Paragraph>
        </div>

        <Card
          title="Danh sách các đơn vị độc lập đang hoạt động"
          extra={
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm mới đơn vị
            </Button>
          }
        >
          <Table dataSource={danhSachDonVi} columns={columnsDonVi} />
        </Card>
      </div>
    </QuyenHanGuard>
  );
});

export default TenantPage;
