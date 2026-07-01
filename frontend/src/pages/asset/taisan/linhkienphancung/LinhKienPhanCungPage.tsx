import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select, DatePicker } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, SettingOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../../stores/AuthStore';
import {
  layDanhSach17,
  themMoi17,
  capNhat17,
  capNhatTrangThai11,
  xoaMem17,
} from '../../../../api-generated/endpoints/linh-kien-phan-cung-controller/linh-kien-phan-cung-controller';
import type { LinhKienPhanCungResponse } from '../../../../api-generated/models/linhKienPhanCungResponse';
import type { LinhKienPhanCungRequest } from '../../../../api-generated/models/linhKienPhanCungRequest';
import { LinhKienPhanCungFormModal } from './LinhKienPhanCungFormModal';
import { GiaTriThuocTinhModal } from './GiaTriThuocTinhModal';

const { Title, Text } = Typography;

export const LinhKienPhanCungPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [danhSach, setDanhSach] = useState<LinhKienPhanCungResponse[]>([]);
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
  const [selectedItem, setSelectedItem] = useState<LinhKienPhanCungResponse | null>(null);
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

      const res = await layDanhSach17({
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
      message.error(e?.message || 'Không thể tải danh sách linh kiện phần cứng!');
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
    layDanhSach17({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSach(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch(() => message.error('Không thể tải lại danh sách!'))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: LinhKienPhanCungRequest) => {
    try {
      if (selectedItem && selectedItem.id) {
        const res = await capNhat17(selectedItem.id, values);
        if (res.code === 200) {
          message.success('Cập nhật linh kiện thành công!');
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || 'Cập nhật thất bại!');
        }
      } else {
        const res = await themMoi17(values);
        if (res.code === 200) {
          message.success('Thêm mới linh kiện thành công!');
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

  const handleToggleStatus = async (record: LinhKienPhanCungResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai11(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(`${nextStatus === 'HOAT_DONG' ? 'Kích hoạt' : 'Khóa'} linh kiện thành công!`);
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
      const res = await xoaMem17(id);
      if (res.code === 200) {
        message.success('Xóa linh kiện thành công!');
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Xóa thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể xóa linh kiện!');
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
        return <Tag color="green">Đã lắp ráp</Tag>;
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
      title: 'Tên mẫu thiết bị',
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
      title: 'Mã mẫu thiết bị gốc',
      dataIndex: 'maMauTaiSanPhanCung',
      key: 'maMauTaiSanPhanCung',
      width: 160,
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
      width: 140,
      render: (val: string) => renderStatus(val),
    },
    {
      title: 'Hành động',
      key: 'hanhDong',
      width: 120,
      render: (_: any, record: LinhKienPhanCungResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.XEM_LINH_KIEN_PHAN_CUNG)
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
          authStore.kiemTraQuyen(QUYEN.SUA_LINH_KIEN_PHAN_CUNG)
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
          authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_LINH_KIEN_PHAN_CUNG)
            ? {
              key: 'toggle_status',
              label: record.trangThai === 'HOAT_DONG' ? 'Khóa linh kiện' : 'Kích hoạt',
              icon: <SafetyOutlined />,
              onClick: () => handleToggleStatus(record),
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_LINH_KIEN_PHAN_CUNG)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title="Xác nhận xóa"
                  description="Bạn có chắc chắn muốn xóa linh kiện này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => handleXoa(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa linh kiện</span>
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_LINH_KIEN_PHAN_CUNG}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Linh kiện phần cứng
            </Title>
            <Text type="secondary">
              Danh sách thực thể các linh kiện phần cứng (RAM, SSD, CPU...) phục vụ lắp ráp, nâng cấp thiết bị.
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_LINH_KIEN_PHAN_CUNG}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedItem(null);
                setFormMode('add');
                setIsFormOpen(true);
              }}
            >
              Thêm linh kiện
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Input
                placeholder="Số Serial, mã thiết bị..."
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
                  { value: 'CAP_PHAT', label: 'Đã lắp ráp' },
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

        <LinhKienPhanCungFormModal
          open={isFormOpen}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedItem(null);
          }}
          selectedLinhKien={selectedItem}
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

export default LinhKienPhanCungPage;
