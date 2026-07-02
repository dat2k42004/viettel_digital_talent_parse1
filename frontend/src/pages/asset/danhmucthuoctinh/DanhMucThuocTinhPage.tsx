import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import {
  layDanhSach23,
  themMoi23,
  capNhat22,
  capNhatTrangThai14,
  xoaMem23,
} from '../../../api-generated/endpoints/danh-muc-thuoc-tinh-controller/danh-muc-thuoc-tinh-controller';
import type { DanhMucThuocTinhResponse } from '../../../api-generated/models/danhMucThuocTinhResponse';
import type { DanhMucThuocTinhRequest } from '../../../api-generated/models/danhMucThuocTinhRequest';
import { DanhMucThuocTinhFormModal } from './DanhMucThuocTinhFormModal';

const { Title, Text } = Typography;

export const DanhMucThuocTinhPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [danhSach, setDanhSach] = useState<DanhMucThuocTinhResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [apDungCho, setApDungCho] = useState<string | undefined>(undefined);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DanhMucThuocTinhResponse | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await layDanhSach23({
        page: page - 1,
        size,
        keyword: keyword || undefined,
        apDungCho: apDungCho || undefined,
      });
      if (res.code === 200 && res.data) {
        setDanhSach(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể tải danh sách thuộc tính động!');
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
    setApDungCho(undefined);
    setCurrentPage(1);
    setLoading(true);
    layDanhSach23({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSach(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch(() => message.error('Không thể tải lại danh sách!'))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: DanhMucThuocTinhRequest) => {
    try {
      if (selectedItem && selectedItem.id) {
        const res = await capNhat22(selectedItem.id, values);
        if (res.code === 200) {
          message.success('Cập nhật thuộc tính thành công!');
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || 'Cập nhật thất bại!');
        }
      } else {
        const res = await themMoi23(values);
        if (res.code === 200) {
          message.success('Thêm mới thuộc tính thành công!');
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

  const handleToggleStatus = async (record: DanhMucThuocTinhResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai14(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(`${nextStatus === 'HOAT_DONG' ? 'Kích hoạt' : 'Khóa'} thuộc tính thành công!`);
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
      const res = await xoaMem23(id);
      if (res.code === 200) {
        message.success('Xóa thuộc tính thành công!');
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Xóa thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể xóa thuộc tính!');
    }
  };

  const renderApDungCho = (val: string) => {
    switch (val) {
      case 'PHAN_CUNG':
        return <Tag color="blue">Thiết bị phần cứng</Tag>;
      case 'PHAN_MEM':
        return <Tag color="purple">Bản quyền phần mềm</Tag>;
      case 'LINH_KIEN':
        return <Tag color="orange">Linh kiện phần cứng</Tag>;
      default:
        return <Tag>{val}</Tag>;
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
      title: 'Mã thuộc tính',
      dataIndex: 'maThuocTinh',
      key: 'maThuocTinh',
      width: 140,
    },
    {
      title: 'Tên thuộc tính',
      dataIndex: 'tenThuocTinh',
      key: 'tenThuocTinh',
    },
    {
      title: 'Kiểu dữ liệu',
      dataIndex: 'kieuDuLieu',
      key: 'kieuDuLieu',
      width: 110,
      render: (val: string) => <Tag color="cyan">{val}</Tag>,
    },
    {
      title: 'Áp dụng cho',
      dataIndex: 'apDungCho',
      key: 'apDungCho',
      width: 180,
      render: (val: string) => renderApDungCho(val),
    },
    {
      title: 'Bắt buộc?',
      dataIndex: 'batBuocNhap',
      key: 'batBuocNhap',
      width: 110,
      render: (val: boolean) => val ? <Tag color="red">Bắt buộc</Tag> : <Tag color="default">Tùy chọn</Tag>,
    },
    {
      title: 'Giá trị mặc định',
      dataIndex: 'giaTriMacDinh',
      key: 'giaTriMacDinh',
      width: 140,
      render: (val: string) => val || '-',
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
      render: (_: any, record: DanhMucThuocTinhResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.XEM_DANH_MUC_THUOC_TINH)
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
          authStore.kiemTraQuyen(QUYEN.SUA_DANH_MUC_THUOC_TINH)
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
          authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_DANH_MUC_THUOC_TINH)
            ? {
              key: 'toggle_status',
              label: record.trangThai === 'HOAT_DONG' ? 'Khóa thuộc tính' : 'Kích hoạt',
              icon: <SafetyOutlined />,
              onClick: () => handleToggleStatus(record),
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_DANH_MUC_THUOC_TINH)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title="Xác nhận xóa"
                  description="Bạn có chắc chắn muốn xóa danh mục thuộc tính này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => handleXoa(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa thuộc tính</span>
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_DANH_MUC_THUOC_TINH}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Danh mục thuộc tính động
            </Title>
            <Text type="secondary">
              Quản lý danh sách các thuộc tính cấu hình mở rộng cho từng loại thực thể tài sản (RAM, Disk, OS, License Seats...).
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_DANH_MUC_THUOC_TINH}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedItem(null);
                setFormMode('add');
                setIsFormOpen(true);
              }}
            >
              Thêm thuộc tính
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Input
                placeholder="Tìm kiếm theo mã thuộc tính, tên thuộc tính..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder="Áp dụng cho phân hệ"
                style={{ width: '100%' }}
                value={apDungCho}
                onChange={setApDungCho}
                allowClear
                options={[
                  { value: 'PHAN_CUNG', label: 'Thiết bị Phần cứng' },
                  { value: 'PHAN_MEM', label: 'Bản quyền Phần mềm' },
                  { value: 'LINH_KIEN', label: 'Linh kiện Phần cứng' },
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

        <DanhMucThuocTinhFormModal
          open={isFormOpen}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedItem(null);
          }}
          selectedThuocTinh={selectedItem}
          mode={formMode}
          onSave={handleSaveForm}
        />
      </div>
    </QuyenHanGuard>
  );
});

export default DanhMucThuocTinhPage;
