import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, Tooltip, message, Popconfirm, Dropdown, Row, Col, Select } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import { layDanhSach, themMoi, capNhat, xoaMem, capNhatTrangThai } from '../../../api-generated/endpoints/vi-tri-controller/vi-tri-controller';
import type { ViTriResponse } from '../../../api-generated/models/viTriResponse';
import type { ViTriRequest } from '../../../api-generated/models/viTriRequest';
import { ViTriFormModal } from './ViTriFormModal';

const { Title, Text } = Typography;

export const ViTriManagementPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [danhSachViTri, setDanhSachViTri] = useState<ViTriResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [searchTen, setSearchTen] = useState('');
  const [searchMa, setSearchMa] = useState('');
  const [searchTrangThai, setSearchTrangThai] = useState<string | undefined>(undefined);
  const [searchLoai, setSearchLoai] = useState<string | undefined>(undefined);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedViTri, setSelectedViTri] = useState<ViTriResponse | null>(null);

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await layDanhSach({
        page: page - 1,
        size,
        tenViTri: searchTen || undefined,
        maViTri: searchMa || undefined,
        trangThai: searchTrangThai || undefined,
        loaiViTri: searchLoai || undefined,
      });
      if (res.code === 200 && res.data) {
        setDanhSachViTri(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể tải danh sách vị trí!');
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
    setSearchLoai(undefined);
    setCurrentPage(1);
    // Reload directly
    setLoading(true);
    layDanhSach({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSachViTri(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch((e) => message.error('Không thể tải lại danh sách!'))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: ViTriRequest) => {
    try {
      if (selectedViTri && selectedViTri.id) {
        const res = await capNhat(selectedViTri.id, values);
        if (res.code === 200) {
          message.success('Cập nhật vị trí thành công!');
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || 'Cập nhật thất bại!');
        }
      } else {
        const res = await themMoi(values);
        if (res.code === 200) {
          message.success('Thêm mới vị trí thành công!');
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || 'Thêm mới thất bại!');
        }
      }
    } catch (e: any) {
      message.error(e?.message || 'Có lỗi xảy ra khi lưu thông tin!');
    }
  };

  const handleToggleStatus = async (record: ViTriResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(`${nextStatus === 'HOAT_DONG' ? 'Mở khóa' : 'Khóa'} vị trí thành công!`);
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Cập nhật trạng thái thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleXoaViTri = async (id: number) => {
    try {
      const res = await xoaMem(id);
      if (res.code === 200) {
        message.success('Xóa vị trí thành công!');
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Xóa thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể xóa vị trí!');
    }
  };

  const renderLoaiViTri = (loai: string) => {
    switch (loai) {
      case 'KHO':
        return 'Kho bãi';
      case 'PHONG_MAY':
        return 'Phòng máy / Server';
      case 'KE_TU':
        return 'Kệ tủ / Rack';
      case 'VAN_PHONG':
        return 'Văn phòng';
      default:
        return loai || 'Chưa phân loại';
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'HOAT_DONG':
        return <Tag color="green">Đang hoạt động</Tag>;
      case 'KHOA':
        return <Tag color="red">Tạm khóa</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã vị trí',
      dataIndex: 'maViTri',
      key: 'maViTri',
      width: 160,
    },
    {
      title: 'Tên vị trí',
      dataIndex: 'tenViTri',
      key: 'tenViTri',
    },
    {
      title: 'Loại vị trí',
      dataIndex: 'loaiViTri',
      key: 'loaiViTri',
      width: 180,
      render: (val: string) => renderLoaiViTri(val),
    },
    {
      title: 'Sức chứa tối đa',
      dataIndex: 'sucChuaToiDa',
      key: 'sucChuaToiDa',
      width: 140,
      render: (val: number) => val || 'Không giới hạn',
    },
    {
      title: 'Diện tích (m²)',
      dataIndex: 'dienTichM2',
      key: 'dienTichM2',
      width: 130,
      render: (val: number) => val ? `${val} m²` : 'N/A',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 140,
      render: (val: string) => renderStatus(val),
    },
    {
      title: 'Hành động',
      key: 'hanhDong',
      width: 110,
      render: (_: any, record: ViTriResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.SUA_VI_TRI)
            ? {
                key: 'edit',
                label: 'Cập nhật',
                icon: <EditOutlined />,
                onClick: () => {
                  setSelectedViTri(record);
                  setIsFormOpen(true);
                },
              }
            : null,
          authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_VI_TRI)
            ? {
                key: 'toggle_status',
                label: record.trangThai === 'HOAT_DONG' ? 'Khóa vị trí' : 'Kích hoạt',
                icon: <SafetyOutlined />,
                onClick: () => handleToggleStatus(record),
              }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_VI_TRI)
            ? {
                key: 'delete',
                label: (
                  <Popconfirm
                    title="Xác nhận xóa"
                    description="Bạn có chắc chắn muốn xóa vị trí này?"
                    okText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() => handleXoaViTri(record.id!)}
                  >
                    <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa vị trí</span>
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_VI_TRI}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý Vị trí & Kho bãi
            </Title>
            <Text type="secondary">
              Danh sách các vị trí lưu trữ tài sản, phòng lab, trung tâm dữ liệu hoặc kho bãi trực thuộc đơn vị.
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_VI_TRI}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedViTri(null);
                setIsFormOpen(true);
              }}
            >
              Thêm vị trí
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Input
                placeholder="Tìm tên vị trí..."
                value={searchTen}
                onChange={(e) => setSearchTen(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={6}>
              <Input
                placeholder="Mã vị trí..."
                value={searchMa}
                onChange={(e) => setSearchMa(e.target.value)}
              />
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder="Loại vị trí"
                style={{ width: '100%' }}
                value={searchLoai}
                onChange={setSearchLoai}
                allowClear
                options={[
                  { value: 'KHO', label: 'Kho bãi' },
                  { value: 'PHONG_MAY', label: 'Phòng máy' },
                  { value: 'KE_TU', label: 'Kệ tủ' },
                  { value: 'VAN_PHONG', label: 'Văn phòng' },
                ]}
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
            dataSource={danhSachViTri}
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

        <ViTriFormModal
          open={isFormOpen}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedViTri(null);
          }}
          selectedViTri={selectedViTri}
          onSave={handleSaveForm}
        />
      </div>
    </QuyenHanGuard>
  );
});

export default ViTriManagementPage;
