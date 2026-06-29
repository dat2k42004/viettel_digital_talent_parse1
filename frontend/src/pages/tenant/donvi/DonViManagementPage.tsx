import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, Tooltip, message, Popconfirm, Dropdown, Row, Col, Select, Descriptions, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import { layDanhSach29, layTheoId21, capNhatThongTin, xoaMem21, capNhatTrangThai13, giaHanHopDong, dangKyDonVi } from '../../../api-generated/endpoints/don-vi-controller/don-vi-controller';
import type { DonViResponse } from '../../../api-generated/models/donViResponse';
import type { DonViUpdateRequest } from '../../../api-generated/models/donViUpdateRequest';
import type { GiaHanHopDongRequest } from '../../../api-generated/models/giaHanHopDongRequest';
import type { DangKyDonViRequest } from '../../../api-generated/models/dangKyDonViRequest';
import { DonViFormModal } from './DonViFormModal';
import { DonViGiaHanModal } from './DonViGiaHanModal';
import { DonViCreateModal } from './DonViCreateModal';

const { Title, Text } = Typography;

export const DonViManagementPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [danhSachDonVi, setDanhSachDonVi] = useState<DonViResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [searchTen, setSearchTen] = useState('');
  const [searchMa, setSearchMa] = useState('');
  const [searchTrangThai, setSearchTrangThai] = useState<string | undefined>(undefined);
  const [searchMaSoThue, setSearchMaSoThue] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGiaHanOpen, setIsGiaHanOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedDonVi, setSelectedDonVi] = useState<DonViResponse | null>(null);
  const [detailDonVi, setDetailDonVi] = useState<DonViResponse | null>(null);

  const handleCreateDonVi = async (values: DangKyDonViRequest) => {
    setCreateLoading(true);
    try {
      const res = await dangKyDonVi(values);
      if (res.code === 200) {
        message.success('Tạo đơn vị thành công, vui lòng nhắc khách hàng check email lấy mã OTP');
        setIsCreateOpen(false);
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Tạo đơn vị thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Có lỗi xảy ra khi tạo đơn vị!');
    } finally {
      setCreateLoading(false);
    }
  };

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await layDanhSach29({
        page: page - 1,
        size,
        ten: searchTen || undefined,
        maDonVi: searchMa || undefined,
        trangThai: searchTrangThai || undefined,
        maSoThue: searchMaSoThue || undefined,
      });
      if (res.code === 200 && res.data) {
        setDanhSachDonVi(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể tải danh sách đơn vị!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    taiDuLieu(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleSearch = () => {
    setCurrentPage(1);
    taiDuLieu(1, pageSize);
  };

  const handleReset = () => {
    setSearchTen('');
    setSearchMa('');
    setSearchTrangThai(undefined);
    setSearchMaSoThue('');
    setCurrentPage(1);
    // Directly call API with empty filters
    setLoading(true);
    layDanhSach29({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSachDonVi(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch((e) => message.error('Không thể tải lại danh sách!'))
      .finally(() => setLoading(false));
  };

  const handleOpenDetail = async (id: number) => {
    try {
      const res = await layTheoId21(id);
      if (res.code === 200 && res.data) {
        setDetailDonVi(res.data);
        setIsDetailOpen(true);
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể lấy thông tin chi tiết đơn vị!');
    }
  };

  const handleSaveForm = async (values: DonViUpdateRequest) => {
    if (!selectedDonVi || !selectedDonVi.id) return;
    try {
      const res = await capNhatThongTin(selectedDonVi.id, values);
      if (res.code === 200) {
        message.success('Cập nhật thông tin đơn vị thành công!');
        setIsFormOpen(false);
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Cập nhật thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Có lỗi xảy ra khi cập nhật!');
    }
  };

  const handleGiaHan = async (values: GiaHanHopDongRequest) => {
    if (!selectedDonVi || !selectedDonVi.id) return;
    try {
      const res = await giaHanHopDong(selectedDonVi.id, values);
      if (res.code === 200) {
        message.success('Gia hạn hợp đồng đơn vị thành công!');
        setIsGiaHanOpen(false);
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Gia hạn thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Có lỗi xảy ra khi gia hạn!');
    }
  };

  const handleToggleStatus = async (record: DonViResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai13(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(`${nextStatus === 'HOAT_DONG' ? 'Mở khóa' : 'Khóa'} đơn vị thành công!`);
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Thay đổi trạng thái thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleXoaDonVi = async (id: number) => {
    try {
      const res = await xoaMem21(id);
      if (res.code === 200) {
        message.success('Xóa đơn vị thành công!');
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Xóa thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể xóa đơn vị!');
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'HOAT_DONG':
        return <Tag color="green">Đang hoạt động</Tag>;
      case 'KHOA':
        return <Tag color="red">Đã tạm khóa</Tag>;
      case 'CHO_XAC_THUC':
        return <Tag color="orange">Chờ xác thực</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã đơn vị',
      dataIndex: 'maDonVi',
      key: 'maDonVi',
      width: 140,
    },
    {
      title: 'Tên pháp lý',
      dataIndex: 'tenPhapLy',
      key: 'tenPhapLy',
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'maSoThue',
      key: 'maSoThue',
      width: 120,
    },
    {
      title: 'Tên miền',
      dataIndex: 'tenMienHeThong',
      key: 'tenMienHeThong',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 140,
      render: (val: string) => renderStatus(val),
    },
    {
      title: 'Hạn hợp đồng',
      dataIndex: 'thoiGianHetHanHopDong',
      key: 'thoiGianHetHanHopDong',
      width: 130,
      render: (val: string) => val ? new Date(val).toLocaleDateString('vi-VN') : 'Không giới hạn',
    },
    {
      title: 'Hành động',
      key: 'hanhDong',
      width: 110,
      render: (_: any, record: DonViResponse) => {
        const items: MenuProps['items'] = [
          {
            key: 'detail',
            label: 'Xem chi tiết',
            icon: <EyeOutlined />,
            onClick: () => handleOpenDetail(record.id!),
          },
          authStore.kiemTraQuyen(QUYEN.SUA_DON_VI)
            ? {
                key: 'edit',
                label: 'Cập nhật',
                icon: <EditOutlined />,
                onClick: () => {
                  setSelectedDonVi(record);
                  setIsFormOpen(true);
                },
              }
            : null,
          authStore.kiemTraQuyen(QUYEN.KHOA_DON_VI) && authStore.laSuperAdmin
            ? {
                key: 'toggle_status',
                label: record.trangThai === 'HOAT_DONG' ? 'Khóa đơn vị' : 'Mở khóa',
                icon: <SafetyOutlined />,
                onClick: () => handleToggleStatus(record),
              }
            : null,
          authStore.kiemTraQuyen(QUYEN.GIA_HAN_DON_VI) && authStore.laSuperAdmin
            ? {
                key: 'gia_han',
                label: 'Gia hạn',
                icon: <PlusOutlined />,
                onClick: () => {
                  setSelectedDonVi(record);
                  setIsGiaHanOpen(true);
                },
              }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_DON_VI)
            ? {
                key: 'delete',
                label: (
                  <Popconfirm
                    title="Xác nhận xóa"
                    description="Bạn có chắc chắn muốn xóa đơn vị này?"
                    okText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() => handleXoaDonVi(record.id!)}
                  >
                    <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa đơn vị</span>
                  </Popconfirm>
                ),
                icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
              }
            : null,
        ].filter(Boolean) as MenuProps['items'];

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button size="small">
              Thao tác <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_DON_VI}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Quản trị Đơn vị đa doanh nghiệp (SaaS Tenants)
            </Title>
            <Text type="secondary">
              Danh sách quản lý toàn bộ các đơn vị độc lập tham gia trên sàn hệ thống ITAM.
            </Text>
          </div>
          {(authStore.laSuperAdmin || authStore.kiemTraQuyen(QUYEN.SUA_DON_VI)) && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateOpen(true)}
            >
              Thêm mới Đơn vị
            </Button>
          )}
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Input
                placeholder="Tìm tên pháp lý đơn vị..."
                value={searchTen}
                onChange={(e) => setSearchTen(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={5}>
              <Input
                placeholder="Mã đơn vị..."
                value={searchMa}
                onChange={(e) => setSearchMa(e.target.value)}
              />
            </Col>
            <Col xs={24} md={5}>
              <Input
                placeholder="Mã số thuế..."
                value={searchMaSoThue}
                onChange={(e) => setSearchMaSoThue(e.target.value)}
              />
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder="Trạng thái"
                style={{ width: '100%' }}
                value={searchTrangThai}
                onChange={setSearchTrangThai}
                allowClear
                options={[
                  { value: 'HOAT_DONG', label: 'Đang hoạt động' },
                  { value: 'KHOA', label: 'Tạm khóa' },
                  { value: 'CHO_XAC_THUC', label: 'Chờ xác thực' },
                ]}
              />
            </Col>
            <Col xs={24} md={4}>
              <Space>
                <Button type="primary" onClick={handleSearch}>
                  Tìm kiếm
                </Button>
                <Button onClick={handleReset}>Reset</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card>
          <Table
            dataSource={danhSachDonVi}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalCount,
              onChange: (p, s) => {
                setCurrentPage(p);
                setPageSize(s);
              },
              showSizeChanger: true,
            }}
          />
        </Card>

        <DonViFormModal
          open={isFormOpen}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedDonVi(null);
          }}
          selectedDonVi={selectedDonVi}
          onSave={handleSaveForm}
        />

        <DonViGiaHanModal
          open={isGiaHanOpen}
          onCancel={() => {
            setIsGiaHanOpen(false);
            setSelectedDonVi(null);
          }}
          onSave={handleGiaHan}
        />

        <DonViCreateModal
          open={isCreateOpen}
          onCancel={() => setIsCreateOpen(false)}
          onSave={handleCreateDonVi}
          loading={createLoading}
        />

        <Modal
          title="Thông tin chi tiết Đơn vị"
          open={isDetailOpen}
          onCancel={() => {
            setIsDetailOpen(false);
            setDetailDonVi(null);
          }}
          footer={[
            <Button key="close" onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={700}
        >
          {detailDonVi && (
            <Descriptions bordered column={2} size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label="Mã đơn vị">{detailDonVi.maDonVi}</Descriptions.Item>
              <Descriptions.Item label="Mã số thuế">{detailDonVi.maSoThue || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Tên pháp lý" span={2}>{detailDonVi.tenPhapLy}</Descriptions.Item>
              <Descriptions.Item label="Tên viết tắt" span={2}>{detailDonVi.tenThuongMai || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Tên miền">{detailDonVi.tenMienHeThong}</Descriptions.Item>
              <Descriptions.Item label="Website">{detailDonVi.duongDanWebsite || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Email">{detailDonVi.emailChinhThuc || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="SĐT di động">{detailDonVi.soDienThoaiDiDong || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="SĐT cố định">{detailDonVi.soDienThoaiCoDinh || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Người đại diện">{[detailDonVi.hoNguoiDaiDien, detailDonVi.tenDemNguoiDaiDien, detailDonVi.tenNguoiDaiDien].filter(Boolean).join(' ') || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Chức vụ đại diện">{detailDonVi.chucVuNguoiDaiDien || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Hạn hợp đồng">{detailDonVi.thoiGianHetHanHopDong ? new Date(detailDonVi.thoiGianHetHanHopDong).toLocaleDateString('vi-VN') : 'Không giới hạn'}</Descriptions.Item>
              <Descriptions.Item label="Tỉnh/Thành phố">{detailDonVi.tinhThanhPho || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Quận/Huyện">{detailDonVi.quanHuyen || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Phường/Xã">{detailDonVi.phuongXa || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ cụ thể" span={2}>{detailDonVi.soNhaTenDuong || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Ngày thành lập">{detailDonVi.thoiGianThanhLap ? new Date(detailDonVi.thoiGianThanhLap).toLocaleDateString('vi-VN') : 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu HĐ">{detailDonVi.thoiGianBatDauHopDong ? new Date(detailDonVi.thoiGianBatDauHopDong).toLocaleDateString('vi-VN') : 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{renderStatus(detailDonVi.trangThai || '')}</Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </QuyenHanGuard>
  );
});

export default DonViManagementPage;
