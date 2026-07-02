import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, Tooltip, message, Popconfirm, Dropdown, Row, Col, Alert } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, DeleteOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import { layDanhSach25, themMoi25, capNhat24, xoaMem25 } from '../../../api-generated/endpoints/danh-muc-cau-hinh-controller/danh-muc-cau-hinh-controller';
import type { DanhMucCauHinhResponse } from '../../../api-generated/models/danhMucCauHinhResponse';
import type { DanhMucCauHinhRequest } from '../../../api-generated/models/danhMucCauHinhRequest';
import { DanhMucCauHinhFormModal } from './DanhMucCauHinhFormModal';

const { Title, Text, Paragraph } = Typography;

export const DanhMucCauHinhPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [danhSachDanhMuc, setDanhSachDanhMuc] = useState<DanhMucCauHinhResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [searchTen, setSearchTen] = useState('');
  const [searchMa, setSearchMa] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DanhMucCauHinhResponse | null>(null);

  // Phân quyền bảo vệ - Chỉ cho phép Super Admin truy cập
  if (!authStore.laSuperAdmin) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Từ chối truy cập"
          description="Khu vực cấu hình hệ thống này chỉ dành riêng cho tài khoản Quản trị cấp cao (Super Admin)."
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
        />
      </div>
    );
  }

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await layDanhSach25({
        page: page - 1,
        size,
        tenCauHinh: searchTen || undefined,
        maCauHinh: searchMa || undefined,
      });
      if (res.code === 200 && res.data) {
        setDanhSachDanhMuc(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể tải danh sách cấu hình hệ thống!');
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
    setCurrentPage(1);
    // Reload directly
    setLoading(true);
    layDanhSach25({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSachDanhMuc(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch((e) => message.error('Không thể tải lại danh sách!'))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: DanhMucCauHinhRequest) => {
    try {
      if (selectedRecord && selectedRecord.id) {
        const res = await capNhat24(selectedRecord.id, values);
        if (res.code === 200) {
          message.success('Cập nhật cấu hình thành công!');
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || 'Cập nhật thất bại!');
        }
      } else {
        const res = await themMoi25(values);
        if (res.code === 200) {
          message.success('Thêm mới cấu hình hệ thống thành công!');
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

  const handleXoaCauHinh = async (id: number) => {
    try {
      const res = await xoaMem25(id);
      if (res.code === 200) {
        message.success('Xóa cấu hình thành công!');
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Xóa thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể xóa cấu hình!');
    }
  };

  const renderNhomCauHinh = (nhom: string) => {
    switch (nhom) {
      case 'HE_THONG':
        return <Tag color="blue">Hệ thống</Tag>;
      case 'BMTT':
        return <Tag color="purple">Bảo mật</Tag>;
      case 'EMAIL':
        return <Tag color="cyan">Email/Thông báo</Tag>;
      case 'TIEU_CHUAN':
        return <Tag color="gold">Tiêu chuẩn</Tag>;
      default:
        return <Tag>{nhom || 'Khác'}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã cấu hình',
      dataIndex: 'maCauHinh',
      key: 'maCauHinh',
      width: 220,
      sorter: (a: any, b: any) => (a.maCauHinh || '').localeCompare(b.maCauHinh || ''),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: 'Tên cấu hình',
      dataIndex: 'tenCauHinh',
      key: 'tenCauHinh',
    },
    {
      title: 'Nhóm',
      dataIndex: 'nhomCauHinh',
      key: 'nhomCauHinh',
      width: 140,
      render: (val: string) => renderNhomCauHinh(val),
    },
    {
      title: 'Loại dữ liệu',
      dataIndex: 'loaiDuLieu',
      key: 'loaiDuLieu',
      width: 120,
    },
    {
      title: 'Giá trị mặc định',
      dataIndex: 'giaTriMacDinh',
      key: 'giaTriMacDinh',
      width: 160,
    },
    {
      title: 'Hành động',
      key: 'hanhDong',
      width: 110,
      render: (_: any, record: DanhMucCauHinhResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.SUA_DANH_MUC_CAU_HINH)
            ? {
              key: 'edit',
              label: 'Cập nhật',
              icon: <EditOutlined />,
              onClick: () => {
                setSelectedRecord(record);
                setIsFormOpen(true);
              },
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_DANH_MUC_CAU_HINH)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title="Xác nhận xóa"
                  description="Bạn có chắc chắn muốn xóa trường cấu hình này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => handleXoaCauHinh(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa cấu hình</span>
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_DANH_MUC_CAU_HINH}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Danh mục cấu hình hệ thống
            </Title>
            <Text type="secondary">
              Định nghĩa các trường cài đặt hệ thống toàn sàn dành cho Super Admin quản trị.
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_DANH_MUC_CAU_HINH}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedRecord(null);
                setIsFormOpen(true);
              }}
            >
              Thêm trường cấu hình
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={10}>
              <Input
                placeholder="Tìm tên cấu hình..."
                value={searchTen}
                onChange={(e) => setSearchTen(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={10}>
              <Input
                placeholder="Mã định danh cấu hình..."
                value={searchMa}
                onChange={(e) => setSearchMa(e.target.value)}
              />
            </Col>
            <Col xs={24} md={4}>
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
            dataSource={danhSachDanhMuc}
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

        <DanhMucCauHinhFormModal
          open={isFormOpen}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedRecord(null);
          }}
          selectedRecord={selectedRecord}
          onSave={handleSaveForm}
        />
      </div>
    </QuyenHanGuard>
  );
});

export default DanhMucCauHinhPage;
