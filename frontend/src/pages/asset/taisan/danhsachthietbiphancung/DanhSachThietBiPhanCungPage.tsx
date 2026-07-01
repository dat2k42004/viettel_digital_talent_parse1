import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select, DatePicker } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, SettingOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../../stores/AuthStore';
import {
  layDanhSach3,
  themMoi3,
  capNhat3,
  capNhatTrangThai3,
  xoaMem3,
} from '../../../../api-generated/endpoints/danh-sach-thiet-bi-phan-cung-controller/danh-sach-thiet-bi-phan-cung-controller';
import type { DanhSachThietBiPhanCungResponse } from '../../../../api-generated/models/danhSachThietBiPhanCungResponse';
import type { DanhSachThietBiPhanCungRequest } from '../../../../api-generated/models/danhSachThietBiPhanCungRequest';
import { DanhSachThietBiPhanCungFormModal } from './DanhSachThietBiPhanCungFormModal';
import { GiaTriThuocTinhModal } from './GiaTriThuocTinhModal';

const { Title, Text } = Typography;

export const DanhSachThietBiPhanCungPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [danhSach, setDanhSach] = useState<DanhSachThietBiPhanCungResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [trangThai, setTrangThai] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [trangThaiKho, setTrangThaiKho] = useState<string | undefined>(undefined);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DanhSachThietBiPhanCungResponse | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

  // Attribute config modal state
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [attrTargetId, setAttrTargetId] = useState<number | null>(null);
  const [attrTargetName, setAttrTargetName] = useState('');

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const tuNgay = dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined;
      const denNgay = dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined;

      const res = await layDanhSach3({
        page: page - 1,
        size,
        keyword: keyword || undefined,
        trangThai: trangThai || undefined,
        tuNgayMua: tuNgay,
        denNgayMua: denNgay,
        trangThaiKho: trangThaiKho || undefined,
      });
      if (res.code === 200 && res.data) {
        setDanhSach(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể tải danh sách thiết bị phần cứng!');
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
    setDateRange(null);
    setTrangThaiKho(undefined);
    setCurrentPage(1);
    setLoading(true);
    layDanhSach3({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSach(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch(() => message.error('Không thể tải lại danh sách!'))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: DanhSachThietBiPhanCungRequest) => {
    try {
      if (selectedItem && selectedItem.id) {
        const res = await capNhat3(selectedItem.id, values);
        if (res.code === 200) {
          message.success('Cập nhật thiết bị thành công!');
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || 'Cập nhật thất bại!');
        }
      } else {
        const res = await themMoi3(values);
        if (res.code === 200) {
          message.success('Thêm mới thiết bị thành công!');
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

  const handleToggleStatus = async (record: DanhSachThietBiPhanCungResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai3(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(`${nextStatus === 'HOAT_DONG' ? 'Kích hoạt' : 'Khóa'} thiết bị thành công!`);
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
      const res = await xoaMem3(id);
      if (res.code === 200) {
        message.success('Xóa thiết bị thành công!');
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Xóa thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể xóa thiết bị!');
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'HOAT_DONG':
        return <Tag color="green">Hoạt động</Tag>;
      case 'KHOA':
        return <Tag color="red">Khóa</Tag>;
      case 'CAP_PHAT':
        return <Tag color="blue">Cấp phát</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const renderTrangThaiKho = (status: string) => {
    switch (status) {
      case 'TON_KHO':
        return <Tag color="cyan">Tồn kho</Tag>;
      case 'CAP_PHAT':
        return <Tag color="green">Đang cấp phát</Tag>;
      case 'BAO_TRI':
        return <Tag color="orange">Đang bảo trì</Tag>;
      case 'THANH_LY':
        return <Tag color="red">Đã thanh lý</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã thẻ tài sản',
      dataIndex: 'maTheTaiSan',
      key: 'maTheTaiSan',
      width: 140,
    },
    {
      title: 'Tên mẫu',
      dataIndex: 'tenTaiSanPhanCung',
      key: 'tenTaiSanPhanCung',
    },
    {
      title: 'Số Serial',
      dataIndex: 'soSerial',
      key: 'soSerial',
      width: 150,
    },
    {
      title: 'Giá mua',
      dataIndex: 'giaMua',
      key: 'giaMua',
      width: 130,
      render: (val: number) => val !== undefined ? `${val.toLocaleString('vi-VN')} đ` : '-',
    },
    {
      title: 'Thời gian mua',
      dataIndex: 'thoiGianMua',
      key: 'thoiGianMua',
      width: 130,
      render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Trạng thái kho',
      dataIndex: 'trangThaiKho',
      key: 'trangThaiKho',
      width: 130,
      render: (val: string) => renderTrangThaiKho(val),
    },
    {
      title: 'Trạng thái vận hành',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 150,
      render: (val: string) => renderStatus(val),
    },
    {
      title: 'Hành động',
      key: 'hanhDong',
      width: 120,
      render: (_: any, record: DanhSachThietBiPhanCungResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.XEM_THIET_BI_PHAN_CUNG)
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
          authStore.kiemTraQuyen(QUYEN.SUA_THIET_BI_PHAN_CUNG)
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
          authStore.kiemTraQuyen(QUYEN.XEM_GIA_TRI_THUOC_TINH)
            ? {
                key: 'attributes',
                label: 'Thuộc tính động',
                icon: <SettingOutlined />,
                onClick: () => {
                  setAttrTargetId(record.id!);
                  setAttrTargetName(record.tenTaiSanPhanCung || record.soSerial || '');
                  setIsAttrModalOpen(true);
                },
              }
            : null,
          authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_THIET_BI_PHAN_CUNG)
            ? {
                key: 'toggle_status',
                label: record.trangThai === 'HOAT_DONG' ? 'Khóa thiết bị' : 'Kích hoạt',
                icon: <SafetyOutlined />,
                onClick: () => handleToggleStatus(record),
              }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_THIET_BI_PHAN_CUNG)
            ? {
                key: 'delete',
                label: (
                  <Popconfirm
                    title="Xác nhận xóa"
                    description="Bạn có chắc chắn muốn xóa thiết bị này?"
                    okText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() => handleXoa(record.id!)}
                  >
                    <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa thiết bị</span>
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_THIET_BI_PHAN_CUNG}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Thiết bị phần cứng
            </Title>
            <Text type="secondary">
              Danh sách thực thể các thiết bị phần cứng (máy tính, màn hình, bàn phím...) đang quản lý tại các đơn vị.
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_THIET_BI_PHAN_CUNG}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedItem(null);
                setFormMode('add');
                setIsFormOpen(true);
              }}
            >
              Thêm thiết bị
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Input
                placeholder="Số Serial, mã thẻ tài sản..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={6}>
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as any)}
                placeholder={['Từ ngày mua', 'Đến ngày mua']}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder="Trạng thái kho"
                style={{ width: '100%' }}
                value={trangThaiKho}
                onChange={setTrangThaiKho}
                allowClear
                options={[
                  { value: 'TON_KHO', label: 'Tồn kho' },
                  { value: 'CAP_PHAT', label: 'Đang cấp phát' },
                  { value: 'BAO_TRI', label: 'Đang bảo trì' },
                  { value: 'THANH_LY', label: 'Đã thanh lý' },
                ]}
              />
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder="Vận hành"
                style={{ width: '100%' }}
                value={trangThai}
                onChange={setTrangThai}
                allowClear
                options={[
                  { value: 'HOAT_DONG', label: 'Hoạt động' },
                  { value: 'KHOA', label: 'Khóa' },
                  { value: 'CAP_PHAT', label: 'Cấp phát' },
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

        <DanhSachThietBiPhanCungFormModal
          open={isFormOpen}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedItem(null);
          }}
          selectedThietBi={selectedItem}
          mode={formMode}
          onSave={handleSaveForm}
        />

        {isAttrModalOpen && attrTargetId && (
          <GiaTriThuocTinhModal
            open={isAttrModalOpen}
            onCancel={() => {
              setIsAttrModalOpen(false);
              setAttrTargetId(null);
            }}
            assetId={attrTargetId}
            assetName={attrTargetName}
          />
        )}
      </div>
    </QuyenHanGuard>
  );
});

export default DanhSachThietBiPhanCungPage;
