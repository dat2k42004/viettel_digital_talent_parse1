import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select, DatePicker } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, SettingOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../../stores/AuthStore';
import {
  layDanhSach2,
  themMoi2,
  capNhat2,
  capNhatTrangThai2,
  xoaMem2,
} from '../../../../api-generated/endpoints/danh-sach-thiet-bi-phan-mem-controller/danh-sach-thiet-bi-phan-mem-controller';
import type { DanhSachThietBiPhanMemResponse } from '../../../../api-generated/models/danhSachThietBiPhanMemResponse';
import type { DanhSachThietBiPhanMemRequest } from '../../../../api-generated/models/danhSachThietBiPhanMemRequest';
import { DanhSachThietBiPhanMemFormModal } from './DanhSachThietBiPhanMemFormModal';
import { GiaTriThuocTinhModal } from './GiaTriThuocTinhModal';

const { Title, Text } = Typography;

export const DanhSachThietBiPhanMemPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [danhSach, setDanhSach] = useState<DanhSachThietBiPhanMemResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [trangThai, setTrangThai] = useState<string | undefined>(undefined);
  const [dateRangeMua, setDateRangeMua] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [dateRangeHetHan, setDateRangeHetHan] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [trangThaiKho, setTrangThaiKho] = useState<string | undefined>(undefined);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DanhSachThietBiPhanMemResponse | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

  // Attribute config modal state
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [attrTargetId, setAttrTargetId] = useState<number | null>(null);
  const [attrTargetName, setAttrTargetName] = useState('');

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const tuNgayMua = dateRangeMua && dateRangeMua[0] ? dateRangeMua[0].format('YYYY-MM-DD') : undefined;
      const denNgayMua = dateRangeMua && dateRangeMua[1] ? dateRangeMua[1].format('YYYY-MM-DD') : undefined;
      const tuNgayHetHan = dateRangeHetHan && dateRangeHetHan[0] ? dateRangeHetHan[0].format('YYYY-MM-DD') : undefined;
      const denNgayHetHan = dateRangeHetHan && dateRangeHetHan[1] ? dateRangeHetHan[1].format('YYYY-MM-DD') : undefined;

      const res = await layDanhSach2({
        page: page - 1,
        size,
        keyword: keyword || undefined,
        trangThai: trangThai || undefined,
        tuNgayMua,
        denNgayMua,
        tuNgayHetHan,
        denNgayHetHan,
        trangThaiKho: trangThaiKho || undefined,
      });
      if (res.code === 200 && res.data) {
        setDanhSach(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể tải danh sách bản quyền phần mềm!');
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
    setDateRangeMua(null);
    setDateRangeHetHan(null);
    setTrangThaiKho(undefined);
    setCurrentPage(1);
    setLoading(true);
    layDanhSach2({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSach(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch(() => message.error('Không thể tải lại danh sách!'))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: DanhSachThietBiPhanMemRequest) => {
    try {
      if (selectedItem && selectedItem.id) {
        const res = await capNhat2(selectedItem.id, values);
        if (res.code === 200) {
          message.success('Cập nhật bản quyền phần mềm thành công!');
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || 'Cập nhật thất bại!');
        }
      } else {
        const res = await themMoi2(values);
        if (res.code === 200) {
          message.success('Thêm mới bản quyền phần mềm thành công!');
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

  const handleToggleStatus = async (record: DanhSachThietBiPhanMemResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai2(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(`${nextStatus === 'HOAT_DONG' ? 'Kích hoạt' : 'Khóa'} bản quyền thành công!`);
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
      const res = await xoaMem2(id);
      if (res.code === 200) {
        message.success('Xóa bản quyền thành công!');
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || 'Xóa thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể xóa bản quyền!');
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
        return <Tag color="cyan">Trong kho (Chưa dùng)</Tag>;
      case 'CAP_PHAT':
        return <Tag color="green">Đang hoạt động</Tag>;
      case 'THANH_LY':
        return <Tag color="red">Đã hủy/Hết hạn</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Tên mẫu phần mềm',
      dataIndex: 'tenTaiSanPhanMem',
      key: 'tenTaiSanPhanMem',
      sorter: (a: any, b: any) => (a.tenTaiSanPhanMem || '').localeCompare(b.tenTaiSanPhanMem || ''),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: 'Key bản quyền',
      dataIndex: 'keyBanQuyen',
      key: 'keyBanQuyen',
      width: 180,
      render: (val: string) => <Text copyable={{ text: val }}>{val ? `${val.substring(0, 15)}...` : '-'}</Text>,
    },
    {
      title: 'Chứng từ mua',
      dataIndex: 'maChungTuMua',
      key: 'maChungTuMua',
      width: 130,
    },
    {
      title: 'Số ghế (Seats)',
      dataIndex: 'tongSoGhe',
      key: 'tongSoGhe',
      width: 100,
    },
    {
      title: 'Giá mua',
      dataIndex: 'giaMua',
      key: 'giaMua',
      width: 130,
      render: (val: number) => val !== undefined ? `${val.toLocaleString('vi-VN')} đ` : '-',
    },
    {
      title: 'Hạn dùng',
      dataIndex: 'thoiGianHetHan',
      key: 'thoiGianHetHan',
      width: 130,
      render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : 'Vĩnh viễn',
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
      render: (_: any, record: DanhSachThietBiPhanMemResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.XEM_THIET_BI_PHAN_MEM)
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
          authStore.kiemTraQuyen(QUYEN.SUA_THIET_BI_PHAN_MEM)
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
                setAttrTargetName(record.tenTaiSanPhanMem || record.keyBanQuyen || '');
                setIsAttrModalOpen(true);
              },
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_THIET_BI_PHAN_MEM)
            ? {
              key: 'toggle_status',
              label: record.trangThai === 'HOAT_DONG' ? 'Khóa bản quyền' : 'Kích hoạt',
              icon: <SafetyOutlined />,
              onClick: () => handleToggleStatus(record),
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_THIET_BI_PHAN_MEM)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title="Xác nhận xóa"
                  description="Bạn có chắc chắn muốn xóa bản quyền phần mềm này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => handleXoa(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa bản quyền</span>
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_THIET_BI_PHAN_MEM}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Bản quyền phần mềm
            </Title>
            <Text type="secondary">
              Quản lý danh sách các key bản quyền, license và thời hạn sử dụng phần mềm tại đơn vị.
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_THIET_BI_PHAN_MEM}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedItem(null);
                setFormMode('add');
                setIsFormOpen(true);
              }}
            >
              Thêm bản quyền
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Input
                placeholder="Key bản quyền, mã chứng từ..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={6}>
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                value={dateRangeMua}
                onChange={(dates) => setDateRangeMua(dates as any)}
                placeholder={['Từ ngày mua', 'Đến ngày mua']}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} md={6}>
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                value={dateRangeHetHan}
                onChange={(dates) => setDateRangeHetHan(dates as any)}
                placeholder={['Từ ngày hết hạn', 'Đến ngày hết hạn']}
                format="DD/MM/YYYY"
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={6}>
              <Select
                placeholder="Trạng thái kho"
                style={{ width: '100%' }}
                value={trangThaiKho}
                onChange={setTrangThaiKho}
                allowClear
                options={[
                  { value: 'TON_KHO', label: 'Trong kho (Chưa dùng)' },
                  { value: 'CAP_PHAT', label: 'Đang hoạt động' },
                  { value: 'THANH_LY', label: 'Đã hủy/Hết hạn' },
                ]}
              />
            </Col>
            <Col xs={24} md={6}>
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

        <DanhSachThietBiPhanMemFormModal
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

export default DanhSachThietBiPhanMemPage;
