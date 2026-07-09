import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      message.error(e?.message || t('linhKienPhanCungPage.khong_the_tai_danh'));
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
      .catch(() => message.error(t('viTriManagementPage.khong_the_tai_lai')))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: LinhKienPhanCungRequest) => {
    try {
      if (selectedItem && selectedItem.id) {
        const res = await capNhat17(selectedItem.id, values);
        if (res.code === 200) {
          message.success(t('linhKienPhanCungPage.cap_nhat_linh_kien'));
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
        }
      } else {
        const res = await themMoi17(values);
        if (res.code === 200) {
          message.success(t('linhKienPhanCungPage.them_moi_linh_kien'));
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || t('viTriManagementPage.them_moi_that_bai'));
        }
      }
    } catch (e: any) {
      message.error(e?.message || t('danhMucCauHinhPage.co_loi_xay_ra'));
    }
  };

  const handleToggleStatus = async (record: LinhKienPhanCungResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai11(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(t('linhKienPhanCungPage.nextstatus_hoat_dong_t_vitrimanagementpage', { khoa: nextStatus === 'HOAT_DONG' ? t('viTriManagementPage.kich_hoat') : t('viTriManagementPage.khoa') }));
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('viTriManagementPage.cap_nhat_trang_thai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('viTriManagementPage.co_loi_xay_ra'));
    }
  };

  const handleXoa = async (id: number) => {
    try {
      const res = await xoaMem17(id);
      if (res.code === 200) {
        message.success(t('linhKienPhanCungPage.xoa_linh_kien_thanh'));
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('viTriManagementPage.xoa_that_bai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('linhKienPhanCungPage.khong_the_xoa_linh'));
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'HOAT_DONG':
        return <Tag color="green">{t('userManagementPage.hoat_dong')}</Tag>;
      case 'KHOA':
        return <Tag color="red">{t('viTriManagementPage.khoa')}</Tag>;
      case 'CAP_PHAT':
        return <Tag color="blue">{t('dashboardPage.cap_phat')}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const renderTrangThaiKho = (status: string) => {
    switch (status) {
      case 'TON_KHO':
        return <Tag color="cyan">{t('linhKienPhanCungPage.ton_kho')}</Tag>;
      case 'CAP_PHAT':
        return <Tag color="green">{t('linhKienPhanCungPage.da_lap_rap')}</Tag>;
      case 'BAO_TRI':
        return <Tag color="orange">{t('linhKienPhanCungPage.dang_bao_tri')}</Tag>;
      case 'THANH_LY':
        return <Tag color="red">{t('linhKienPhanCungPage.da_thanh_ly')}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: t('linhKienPhanCungPage.ten_mau_thiet_bi'),
      dataIndex: 'tenTaiSanPhanCung',
      key: 'tenTaiSanPhanCung',
      sorter: (a: any, b: any) => (a.tenTaiSanPhanCung || '').localeCompare(b.tenTaiSanPhanCung || ''),
    },
    {
      title: t('baoCaoPage.so_serial'),
      dataIndex: 'soSerial',
      key: 'soSerial',
      width: 150,
      sorter: (a: any, b: any) => (a.soSerial || '').localeCompare(b.soSerial || ''),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: t('linhKienPhanCungPage.ma_mau_thiet_bi'),
      dataIndex: 'maMauTaiSanPhanCung',
      key: 'maMauTaiSanPhanCung',
      width: 160,
    },
    {
      title: t('linhKienPhanCungPage.gia_mua'),
      dataIndex: 'giaMua',
      key: 'giaMua',
      width: 130,
      render: (val: number) => val !== undefined ? t('danhSachThietBiPhanCungPage.val_tolocalestring_vi_vn_d', { toLocaleStringviVN: val.toLocaleString('vi-VN') }) : '-',
    },
    {
      title: t('linhKienPhanCungPage.thoi_gian_mua'),
      dataIndex: 'thoiGianMua',
      key: 'thoiGianMua',
      width: 130,
      render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
    },
    {
      title: t('linhKienPhanCungPage.trang_thai_kho'),
      dataIndex: 'trangThaiKho',
      key: 'trangThaiKho',
      width: 130,
      render: (val: string) => renderTrangThaiKho(val),
    },
    {
      title: t('linhKienPhanCungPage.trang_thai_van_hanh'),
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 140,
      render: (val: string) => renderStatus(val),
    },
    {
      title: t('viTriManagementPage.hanh_dong'),
      key: 'hanhDong',
      width: 120,
      render: (_: any, record: LinhKienPhanCungResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.XEM_LINH_KIEN_PHAN_CUNG)
            ? {
              key: 'view',
              label: t('linhKienPhanCungPage.chi_tiet'),
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
              label: t('viTriManagementPage.cap_nhat'),
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
              label: t('linhKienPhanCungPage.thuoc_tinh_dong'),
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
              label: record.trangThai === 'HOAT_DONG' ? t('linhKienPhanCungPage.khoa_linh_kien') : t('viTriManagementPage.kich_hoat'),
              icon: <SafetyOutlined />,
              onClick: () => handleToggleStatus(record),
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_LINH_KIEN_PHAN_CUNG)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title={t('viTriManagementPage.xac_nhan_xoa')}
                  description={t('linhKienPhanCungPage.ban_co_chac_chan')}
                  okText={t('viTriManagementPage.xoa')}
                  cancelText={t('viTriManagementPage.huy')}
                  onConfirm={() => handleXoa(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>{t('linhKienPhanCungPage.xoa_linh_kien')}</span>
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
                placeholder={t('linhKienPhanCungPage.so_serial_ma_thiet')}
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
                placeholder={[t('linhKienPhanCungPage.tu_ngay_mua'), t('linhKienPhanCungPage.den_ngay_mua')]}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder={t('linhKienPhanCungPage.trang_thai_kho')}
                style={{ width: '100%' }}
                value={trangThaiKho}
                onChange={setTrangThaiKho}
                allowClear
                options={[
                  { value: 'TON_KHO', label: t('linhKienPhanCungPage.ton_kho') },
                  { value: 'CAP_PHAT', label: t('linhKienPhanCungPage.da_lap_rap') },
                  { value: 'BAO_TRI', label: t('linhKienPhanCungPage.dang_bao_tri') },
                  { value: 'THANH_LY', label: t('linhKienPhanCungPage.da_thanh_ly') },
                ]}
              />
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder={t('linhKienPhanCungPage.van_hanh')}
                style={{ width: '100%' }}
                value={trangThai}
                onChange={setTrangThai}
                allowClear
                options={[
                  { value: 'HOAT_DONG', label: t('userManagementPage.hoat_dong') },
                  { value: 'KHOA', label: t('viTriManagementPage.khoa') },
                  { value: 'CAP_PHAT', label: t('dashboardPage.cap_phat') },
                ]}
              />
            </Col>
            <Col xs={24} md={4}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  Tìm kiếm
                </Button>
                <Button onClick={handleReset}>{t('viTriManagementPage.lam_moi')}</Button>
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
