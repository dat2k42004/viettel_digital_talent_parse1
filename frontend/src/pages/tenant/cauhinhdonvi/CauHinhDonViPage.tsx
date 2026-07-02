import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, Tooltip, message, Popconfirm, Dropdown, Row, Col } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import { layDanhSach26, themMoi26, capNhat25, xoaMem26 } from '../../../api-generated/endpoints/cau-hinh-don-vi-controller/cau-hinh-don-vi-controller';
import type { CauHinhDonViResponse } from '../../../api-generated/models/cauHinhDonViResponse';
import type { CauHinhDonViRequest } from '../../../api-generated/models/cauHinhDonViRequest';
import { CauHinhDonViFormModal } from './CauHinhDonViFormModal';

const { Title, Text } = Typography;

export const CauHinhDonViPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [danhSachCauHinh, setDanhSachCauHinh] = useState<CauHinhDonViResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [searchTen, setSearchTen] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CauHinhDonViResponse | null>(null);

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await layDanhSach26({
        page: page - 1,
        size,
        tenCauHinh: searchTen || undefined,
      });
      if (res.code === 200 && res.data) {
        setDanhSachCauHinh(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể tải danh sách cấu hình của đơn vị!');
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
    setCurrentPage(1);
    // Reload directly
    setLoading(true);
    layDanhSach26({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSachCauHinh(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch((e) => message.error('Không thể tải lại danh sách!'))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: CauHinhDonViRequest) => {
    try {
      if (selectedRecord && selectedRecord.id) {
        const res = await capNhat25(selectedRecord.id, values);
        if (res.code === 200) {
          message.success('Cập nhật cấu hình đơn vị thành công!');
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || 'Cập nhật thất bại!');
        }
      } else {
        const res = await themMoi26(values);
        if (res.code === 200) {
          message.success('Thêm cấu hình riêng cho đơn vị thành công!');
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || 'Lưu thất bại!');
        }
      }
    } catch (e: any) {
      message.error(e?.message || 'Có lỗi xảy ra khi lưu thông tin!');
    }
  };

  const handleXoaCauHinh = async (id: number) => {
    try {
      const res = await xoaMem26(id);
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

  const columns = [
    {
      title: 'Mã cấu hình',
      dataIndex: 'maCauHinh',
      key: 'maCauHinh',
      width: 220,
    },
    {
      title: 'Tên cấu hình',
      dataIndex: 'tenCauHinh',
      key: 'tenCauHinh',
    },
    {
      title: 'Giá trị cấu hình riêng',
      dataIndex: 'giaTriCauHinh',
      key: 'giaTriCauHinh',
    },
    {
      title: 'Hành động',
      key: 'hanhDong',
      width: 110,
      render: (_: any, record: CauHinhDonViResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.SUA_CAU_HINH_DON_VI)
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
          authStore.kiemTraQuyen(QUYEN.XOA_CAU_HINH_DON_VI)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title="Xác nhận xóa"
                  description="Bạn có chắc chắn muốn xóa cấu hình riêng này? Hệ thống sẽ sử dụng giá trị mặc định."
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_CAU_HINH_DON_VI}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Cấu hình Đơn vị
            </Title>
            <Text type="secondary">
              Thiết lập các thông số hoạt động, chính sách và SMTP riêng biệt áp dụng cho đơn vị của bạn.
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_CAU_HINH_DON_VI}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedRecord(null);
                setIsFormOpen(true);
              }}
            >
              Thêm cấu hình
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Input
                placeholder="Tìm kiếm theo tên cấu hình..."
                value={searchTen}
                onChange={(e) => setSearchTen(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={8}>
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
            dataSource={danhSachCauHinh}
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

        <CauHinhDonViFormModal
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

export default CauHinhDonViPage;
