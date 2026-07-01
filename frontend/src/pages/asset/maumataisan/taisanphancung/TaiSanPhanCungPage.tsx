import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../../stores/AuthStore';
import {
  layDanhSach5,
  themMoi5,
  capNhat5,
  capNhatTrangThai5,
  xoaMem5,
} from '../../../../api-generated/endpoints/tai-san-phan-cung-controller/tai-san-phan-cung-controller';
import type { TaiSanPhanCungResponse } from '../../../../api-generated/models/taiSanPhanCungResponse';
import type { TaiSanPhanCungRequest } from '../../../../api-generated/models/taiSanPhanCungRequest';
import { TaiSanPhanCungFormModal } from './TaiSanPhanCungFormModal';

const { Title, Text } = Typography;

export const TaiSanPhanCungPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [danhSach, setDanhSach] = useState<TaiSanPhanCungResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [trangThai, setTrangThai] = useState<string | undefined>(undefined);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TaiSanPhanCungResponse | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await layDanhSach5({
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
      message.error(e?.message || 'Không thể tải danh sách mẫu thiết bị phần cứng!');
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
    layDanhSach5({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSach(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch(() => message.error('Không thể tải lại danh sách!'))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: TaiSanPhanCungRequest) => {
    try {
      if (selectedItem && selectedItem.id) {
        const res = await capNhat5(selectedItem.id, values);
        if (res.code === 200) {
          message.success('Cập nhật mẫu thiết bị phần cứng thành công!');
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || 'Cập nhật thất bại!');
        }
      } else {
        const res = await themMoi5(values);
        if (res.code === 200) {
          message.success('Thêm mới mẫu thiết bị phần cứng thành công!');
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

  const handleToggleStatus = async (record: TaiSanPhanCungResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai5(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(`${nextStatus === 'HOAT_DONG' ? 'Kích hoạt' : 'Khóa'} mẫu thiết bị thành công!`);
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
      const res = await xoaMem5(id);
      if (res.code === 200) {
        message.success('Xóa mẫu thiết bị phần cứng thành công!');
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Xóa thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể xóa mẫu thiết bị!');
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
      title: 'Mã mẫu',
      dataIndex: 'maMau',
      key: 'maMau',
      width: 120,
    },
    {
      title: 'Tên mẫu',
      dataIndex: 'tenMau',
      key: 'tenMau',
    },
    {
      title: 'Hãng sản xuất',
      dataIndex: 'tenHangSanXuat',
      key: 'tenHangSanXuat',
    },
    {
      title: 'Loại tài sản',
      dataIndex: 'tenLoaiTaiSan',
      key: 'tenLoaiTaiSan',
    },
    {
      title: 'Danh mục',
      dataIndex: 'tenDanhMucTaiSan',
      key: 'tenDanhMucTaiSan',
    },
    {
      title: 'Tháo lắp?',
      dataIndex: 'coTheThaoLap',
      key: 'coTheThaoLap',
      width: 110,
      render: (val: boolean) => val ? <Tag color="blue">Có</Tag> : <Tag color="default">Không</Tag>,
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
      render: (_: any, record: TaiSanPhanCungResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.XEM_TAI_SAN_PHAN_CUNG)
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
          authStore.kiemTraQuyen(QUYEN.SUA_TAI_SAN_PHAN_CUNG)
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
          authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_TAI_SAN_PHAN_CUNG)
            ? {
                key: 'toggle_status',
                label: record.trangThai === 'HOAT_DONG' ? 'Khóa mẫu' : 'Kích hoạt',
                icon: <SafetyOutlined />,
                onClick: () => handleToggleStatus(record),
              }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_TAI_SAN_PHAN_CUNG)
            ? {
                key: 'delete',
                label: (
                  <Popconfirm
                    title="Xác nhận xóa"
                    description="Bạn có chắc chắn muốn xóa mẫu thiết bị phần cứng này?"
                    okText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() => handleXoa(record.id!)}
                  >
                    <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa mẫu</span>
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_TAI_SAN_PHAN_CUNG}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Mẫu mã phần cứng
            </Title>
            <Text type="secondary">
              Quản lý danh sách các mẫu mã, cấu hình chuẩn thiết bị phần cứng.
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_TAI_SAN_PHAN_CUNG}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedItem(null);
                setFormMode('add');
                setIsFormOpen(true);
              }}
            >
              Thêm mẫu thiết bị
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Input
                placeholder="Tìm kiếm theo mã mẫu, tên mẫu..."
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

        <TaiSanPhanCungFormModal
          open={isFormOpen}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedItem(null);
          }}
          selectedTaiSanPhanCung={selectedItem}
          mode={formMode}
          onSave={handleSaveForm}
        />
      </div>
    </QuyenHanGuard>
  );
});

export default TaiSanPhanCungPage;
