import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, Tooltip, message, Popconfirm, Dropdown, Row, Col, Select } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import { layDanhSach6, themMoi6, capNhat6, xoaMem6, capNhatTrangThai6 } from '../../../api-generated/endpoints/phong-ban-controller/phong-ban-controller';
import type { PhongBanResponse } from '../../../api-generated/models/phongBanResponse';
import type { PhongBanRequest } from '../../../api-generated/models/phongBanRequest';
import { PhongBanFormModal } from './PhongBanFormModal';

const { Title, Text } = Typography;

export const PhongBanManagementPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [danhSachPhongBan, setDanhSachPhongBan] = useState<PhongBanResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [searchTen, setSearchTen] = useState('');
  const [searchMa, setSearchMa] = useState('');
  const [searchTrangThai, setSearchTrangThai] = useState<string | undefined>(undefined);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPhongBan, setSelectedPhongBan] = useState<PhongBanResponse | null>(null);

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await layDanhSach6({
        page: page - 1,
        size,
        tenPhongBan: searchTen || undefined,
        maPhongBan: searchMa || undefined,
        trangThai: searchTrangThai || undefined,
      });
      if (res.code === 200 && res.data) {
        setDanhSachPhongBan(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể tải danh sách phòng ban!');
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
    setCurrentPage(1);
    // Reload directly
    setLoading(true);
    layDanhSach6({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSachPhongBan(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch((e) => message.error('Không thể tải lại danh sách!'))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: PhongBanRequest) => {
    try {
      if (selectedPhongBan && selectedPhongBan.id) {
        const res = await capNhat6(selectedPhongBan.id, values);
        if (res.code === 200) {
          message.success('Cập nhật phòng ban thành công!');
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || 'Cập nhật thất bại!');
        }
      } else {
        const res = await themMoi6(values);
        if (res.code === 200) {
          message.success('Thêm mới phòng ban thành công!');
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

  const handleToggleStatus = async (record: PhongBanResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai6(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(`${nextStatus === 'HOAT_DONG' ? 'Kích hoạt' : 'Khóa'} phòng ban thành công!`);
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Cập nhật trạng thái thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleXoaPhongBan = async (id: number) => {
    try {
      const res = await xoaMem6(id);
      if (res.code === 200) {
        message.success('Xóa phòng ban thành công!');
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Xóa thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể xóa phòng ban!');
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
      title: 'Mã phòng ban',
      dataIndex: 'maPhongBan',
      key: 'maPhongBan',
      width: 160,
    },
    {
      title: 'Tên phòng ban',
      dataIndex: 'tenPhongBan',
      key: 'tenPhongBan',
    },
    {
      title: 'Tên viết tắt',
      dataIndex: 'tenVietTat',
      key: 'tenVietTat',
      width: 140,
    },
    {
      title: 'Email nhóm',
      dataIndex: 'emailNhom',
      key: 'emailNhom',
    },
    {
      title: 'Hotline phòng',
      dataIndex: 'soHotlinePhong',
      key: 'soHotlinePhong',
      width: 150,
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
      render: (_: any, record: PhongBanResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.SUA_PHONG_BAN)
            ? {
                key: 'edit',
                label: 'Cập nhật',
                icon: <EditOutlined />,
                onClick: () => {
                  setSelectedPhongBan(record);
                  setIsFormOpen(true);
                },
              }
            : null,
          authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_PHONG_BAN)
            ? {
                key: 'toggle_status',
                label: record.trangThai === 'HOAT_DONG' ? 'Khóa phòng ban' : 'Kích hoạt',
                icon: <SafetyOutlined />,
                onClick: () => handleToggleStatus(record),
              }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_PHONG_BAN)
            ? {
                key: 'delete',
                label: (
                  <Popconfirm
                    title="Xác nhận xóa"
                    description="Bạn có chắc chắn muốn xóa phòng ban này?"
                    okText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() => handleXoaPhongBan(record.id!)}
                  >
                    <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa phòng ban</span>
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_PHONG_BAN}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý Phòng ban
            </Title>
            <Text type="secondary">
              Danh sách phòng ban, bộ phận cấu trúc trực thuộc đơn vị của bạn.
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_PHONG_BAN}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedPhongBan(null);
                setIsFormOpen(true);
              }}
            >
              Thêm phòng ban
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Input
                placeholder="Tìm tên phòng ban..."
                value={searchTen}
                onChange={(e) => setSearchTen(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={8}>
              <Input
                placeholder="Mã phòng ban..."
                value={searchMa}
                onChange={(e) => setSearchMa(e.target.value)}
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
            dataSource={danhSachPhongBan}
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

        <PhongBanFormModal
          open={isFormOpen}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedPhongBan(null);
          }}
          selectedPhongBan={selectedPhongBan}
          onSave={handleSaveForm}
        />
      </div>
    </QuyenHanGuard>
  );
});

export default PhongBanManagementPage;
