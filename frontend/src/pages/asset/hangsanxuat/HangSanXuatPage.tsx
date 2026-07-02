import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import {
  layDanhSach20,
  themMoi20,
  capNhat19,
  capNhatTrangThai12,
  xoaMem19,
} from '../../../api-generated/endpoints/hang-san-xuat-controller/hang-san-xuat-controller';
import type { HangSanXuatResponse } from '../../../api-generated/models/hangSanXuatResponse';
import type { HangSanXuatRequest } from '../../../api-generated/models/hangSanXuatRequest';
import { HangSanXuatFormModal } from './HangSanXuatFormModal';

const { Title, Text } = Typography;

export const HangSanXuatPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [danhSach, setDanhSach] = useState<HangSanXuatResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [trangThai, setTrangThai] = useState<string | undefined>(undefined);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HangSanXuatResponse | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await layDanhSach20({
        page: page - 1,
        size,
        keyword: keyword || undefined,
        trangThai: trangThai || undefined,
      });
      if (res.code === 200 && res.data) {
        setDanhSach(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể tải danh sách hãng sản xuất!');
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
    setKeyword('');
    setTrangThai(undefined);
    setCurrentPage(1);
    setLoading(true);
    layDanhSach20({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSach(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch(() => message.error('Không thể tải lại danh sách!'))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: HangSanXuatRequest) => {
    try {
      if (selectedItem && selectedItem.id) {
        const res = await capNhat19(selectedItem.id, values);
        if (res.code === 200) {
          message.success('Cập nhật hãng sản xuất thành công!');
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || 'Cập nhật thất bại!');
        }
      } else {
        const res = await themMoi20(values);
        if (res.code === 200) {
          message.success('Thêm mới hãng sản xuất thành công!');
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

  const handleToggleStatus = async (record: HangSanXuatResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai12(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(`${nextStatus === 'HOAT_DONG' ? 'Kích hoạt' : 'Khóa'} hãng sản xuất thành công!`);
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Cập nhật trạng thái thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleXoa = async (id: number) => {
    try {
      const res = await xoaMem19(id);
      if (res.code === 200) {
        message.success('Xóa hãng sản xuất thành công!');
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Xóa thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể xóa hãng sản xuất!');
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
      title: 'Mã hãng',
      dataIndex: 'maHang',
      key: 'maHang',
      width: 120,
      sorter: (a: any, b: any) => (a.maHang || '').localeCompare(b.maHang || ''),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: 'Tên hãng sản xuất',
      dataIndex: 'tenHang',
      key: 'tenHang',
    },
    {
      title: 'Website hỗ trợ',
      dataIndex: 'websiteHoTro',
      key: 'websiteHoTro',
      render: (val: string) => val ? <a href={val} target="_blank" rel="noreferrer">{val}</a> : '-',
    },
    {
      title: 'Hotline',
      dataIndex: 'hotlineHoTro',
      key: 'hotlineHoTro',
      width: 130,
    },
    {
      title: 'Email hỗ trợ',
      dataIndex: 'emailHoTro',
      key: 'emailHoTro',
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
      width: 120,
      render: (_: any, record: HangSanXuatResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.XEM_HANG_SAN_XUAT)
            ? {
              key: 'view',
              label: 'Chi tiết',
              icon: <EyeOutlined />,
              onClick: () => {
                setSelectedItem(record);
                setFormMode('view');
                setIsFormOpen(true);
              },
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.SUA_HANG_SAN_XUAT)
            ? {
              key: 'edit',
              label: 'Cập nhật',
              icon: <EditOutlined />,
              onClick: () => {
                setSelectedItem(record);
                setFormMode('edit');
                setIsFormOpen(true);
              },
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_HANG_SAN_XUAT)
            ? {
              key: 'toggle_status',
              label: record.trangThai === 'HOAT_DONG' ? 'Khóa hãng' : 'Kích hoạt',
              icon: <SafetyOutlined />,
              onClick: () => handleToggleStatus(record),
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_HANG_SAN_XUAT)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title="Xác nhận xóa"
                  description="Bạn có chắc chắn muốn xóa hãng sản xuất này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => handleXoa(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa hãng</span>
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_HANG_SAN_XUAT}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Hãng sản xuất
            </Title>
            <Text type="secondary">
              Quản lý danh sách các nhà sản xuất, thương hiệu cung cấp thiết bị phần cứng/phần mềm.
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_HANG_SAN_XUAT}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedItem(null);
                setFormMode('add');
                setIsFormOpen(true);
              }}
            >
              Thêm hãng sản xuất
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Input
                placeholder="Tìm kiếm theo mã hãng, tên hãng..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder="Trạng thái"
                style={{ width: '100%' }}
                value={trangThai}
                onChange={setTrangThai}
                allowClear
                options={[
                  { value: 'HOAT_DONG', label: 'Đang hoạt động' },
                  { value: 'KHOA', label: 'Tạm khóa' },
                ]}
              />
            </Col>
            <Col xs={24} md={6}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  Tìm kiếm
                </Button>
                <Button onClick={handleReset}>Làm mới</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card>
          <Table
            dataSource={danhSach}
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

        <HangSanXuatFormModal
          open={isFormOpen}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedItem(null);
          }}
          selectedHangSanXuat={selectedItem}
          mode={formMode}
          onSave={handleSaveForm}
        />
      </div>
    </QuyenHanGuard>
  );
});

export default HangSanXuatPage;
