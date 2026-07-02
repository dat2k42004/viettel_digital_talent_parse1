import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../../stores/AuthStore';
import {
  layDanhSach4,
  themMoi4,
  capNhat4,
  capNhatTrangThai4,
  xoaMem4,
} from '../../../../api-generated/endpoints/tai-san-phan-mem-controller/tai-san-phan-mem-controller';
import type { TaiSanPhanMemResponse } from '../../../../api-generated/models/taiSanPhanMemResponse';
import type { TaiSanPhanMemRequest } from '../../../../api-generated/models/taiSanPhanMemRequest';
import { TaiSanPhanMemFormModal } from './TaiSanPhanMemFormModal';

const { Title, Text } = Typography;

export const TaiSanPhanMemPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [danhSach, setDanhSach] = useState<TaiSanPhanMemResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [trangThai, setTrangThai] = useState<string | undefined>(undefined);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TaiSanPhanMemResponse | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await layDanhSach4({
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
      message.error(e?.message || 'Không thể tải danh sách mẫu phần mềm!');
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
    layDanhSach4({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSach(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch(() => message.error('Không thể tải lại danh sách!'))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: TaiSanPhanMemRequest) => {
    try {
      if (selectedItem && selectedItem.id) {
        const res = await capNhat4(selectedItem.id, values);
        if (res.code === 200) {
          message.success('Cập nhật mẫu phần mềm thành công!');
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || 'Cập nhật thất bại!');
        }
      } else {
        const res = await themMoi4(values);
        if (res.code === 200) {
          message.success('Thêm mới mẫu phần mềm thành công!');
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

  const handleToggleStatus = async (record: TaiSanPhanMemResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai4(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(`${nextStatus === 'HOAT_DONG' ? 'Kích hoạt' : 'Khóa'} mẫu phần mềm thành công!`);
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
      const res = await xoaMem4(id);
      if (res.code === 200) {
        message.success('Xóa mẫu phần mềm thành công!');
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Xóa thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể xóa mẫu phần mềm!');
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
      title: 'Hình thức triển khai',
      dataIndex: 'hinhThucTrienKhai',
      key: 'hinhThucTrienKhai',
    },
    {
      title: 'Hình thức cấp phép',
      dataIndex: 'hinhThucCapPhep',
      key: 'hinhThucCapPhep',
    },
    {
      title: 'Nền tảng hỗ trợ',
      dataIndex: 'nenTangHoTro',
      key: 'nenTangHoTro',
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
      render: (_: any, record: TaiSanPhanMemResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.XEM_TAI_SAN_PHAN_MEM)
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
          authStore.kiemTraQuyen(QUYEN.SUA_TAI_SAN_PHAN_MEM)
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
          authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_TAI_SAN_PHAN_MEM)
            ? {
              key: 'toggle_status',
              label: record.trangThai === 'HOAT_DONG' ? 'Khóa mẫu' : 'Kích hoạt',
              icon: <SafetyOutlined />,
              onClick: () => handleToggleStatus(record),
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_TAI_SAN_PHAN_MEM)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title="Xác nhận xóa"
                  description="Bạn có chắc chắn muốn xóa mẫu phần mềm này?"
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_TAI_SAN_PHAN_MEM}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Mẫu mã phần mềm
            </Title>
            <Text type="secondary">
              Quản lý danh sách các mẫu phần mềm, hệ điều hành và giấy phép bản quyền chuẩn.
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_TAI_SAN_PHAN_MEM}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedItem(null);
                setFormMode('add');
                setIsFormOpen(true);
              }}
            >
              Thêm mẫu phần mềm
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

        <TaiSanPhanMemFormModal
          open={isFormOpen}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedItem(null);
          }}
          selectedTaiSanPhanMem={selectedItem}
          mode={formMode}
          onSave={handleSaveForm}
        />
      </div>
    </QuyenHanGuard>
  );
});

export default TaiSanPhanMemPage;
