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
  const { t } = useTranslation();
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
      message.error(e?.message || t('danhSachThietBiPhanMemPage.khong_the_tai_danh'));
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
      .catch(() => message.error(t('viTriManagementPage.khong_the_tai_lai')))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: DanhSachThietBiPhanMemRequest) => {
    try {
      if (selectedItem && selectedItem.id) {
        const res = await capNhat2(selectedItem.id, values);
        if (res.code === 200) {
          message.success(t('danhSachThietBiPhanMemPage.cap_nhat_ban_quyen'));
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
        }
      } else {
        const res = await themMoi2(values);
        if (res.code === 200) {
          message.success(t('danhSachThietBiPhanMemPage.them_moi_ban_quyen'));
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

  const handleToggleStatus = async (record: DanhSachThietBiPhanMemResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai2(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(t('danhSachThietBiPhanMemPage.nextstatus_hoat_dong_t_vitrimanagementpage', { khoa: nextStatus === 'HOAT_DONG' ? t('viTriManagementPage.kich_hoat') : t('viTriManagementPage.khoa') }));
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
      const res = await xoaMem2(id);
      if (res.code === 200) {
        message.success(t('danhSachThietBiPhanMemPage.xoa_ban_quyen_thanh'));
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('viTriManagementPage.xoa_that_bai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('danhSachThietBiPhanMemPage.khong_the_xoa_ban'));
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
        return <Tag color="cyan">{t('danhSachThietBiPhanMemPage.trong_kho_chua_dung')}</Tag>;
      case 'CAP_PHAT':
        return <Tag color="green">{t('loaiTaiSanFormModal.dang_hoat_dong')}</Tag>;
      case 'THANH_LY':
        return <Tag color="red">{t('danhSachThietBiPhanMemPage.da_huyhet_han')}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: t('danhSachThietBiPhanMemPage.ten_mau_phan_mem'),
      dataIndex: 'tenTaiSanPhanMem',
      key: 'tenTaiSanPhanMem',
      sorter: (a: any, b: any) => (a.tenTaiSanPhanMem || '').localeCompare(b.tenTaiSanPhanMem || ''),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: t('danhSachThietBiPhanMemPage.key_ban_quyen'),
      dataIndex: 'keyBanQuyen',
      key: 'keyBanQuyen',
      width: 180,
      render: (val: string) => <Text copyable={{ text: val }}>{val ? `${val.substring(0, 15)}...` : '-'}</Text>,
    },
    {
      title: t('danhSachThietBiPhanMemPage.chung_tu_mua'),
      dataIndex: 'maChungTuMua',
      key: 'maChungTuMua',
      width: 130,
    },
    {
      title: t('danhSachThietBiPhanMemPage.so_ghe_seats'),
      dataIndex: 'tongSoGhe',
      key: 'tongSoGhe',
      width: 100,
    },
    {
      title: t('linhKienPhanCungPage.gia_mua'),
      dataIndex: 'giaMua',
      key: 'giaMua',
      width: 130,
      render: (val: number) => val !== undefined ? t('danhSachThietBiPhanCungPage.val_tolocalestring_vi_vn_d', { toLocaleStringviVN: val.toLocaleString('vi-VN') }) : '-',
    },
    {
      title: t('danhSachThietBiPhanMemPage.han_dung'),
      dataIndex: 'thoiGianHetHan',
      key: 'thoiGianHetHan',
      width: 130,
      render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : t('danhSachThietBiPhanMemPage.vinh_vien'),
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
      render: (_: any, record: DanhSachThietBiPhanMemResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.XEM_THIET_BI_PHAN_MEM)
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
          authStore.kiemTraQuyen(QUYEN.SUA_THIET_BI_PHAN_MEM)
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
                setAttrTargetName(record.tenTaiSanPhanMem || record.keyBanQuyen || '');
                setIsAttrModalOpen(true);
              },
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_THIET_BI_PHAN_MEM)
            ? {
              key: 'toggle_status',
              label: record.trangThai === 'HOAT_DONG' ? t('danhSachThietBiPhanMemPage.khoa_ban_quyen') : t('viTriManagementPage.kich_hoat'),
              icon: <SafetyOutlined />,
              onClick: () => handleToggleStatus(record),
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_THIET_BI_PHAN_MEM)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title={t('viTriManagementPage.xac_nhan_xoa')}
                  description={t('danhSachThietBiPhanMemPage.ban_co_chac_chan')}
                  okText={t('viTriManagementPage.xoa')}
                  cancelText={t('viTriManagementPage.huy')}
                  onConfirm={() => handleXoa(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>{t('danhSachThietBiPhanMemPage.xoa_ban_quyen')}</span>
                </Popconfirm>
              ),
              icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
            }
            : null,
        ].filter(Boolean) as MenuProps['items'];

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button size="small">
              {t('common.actionBtn')} <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_THIET_BI_PHAN_MEM}>
      <div style={{ width: '100%', minWidth: 0 }}>
        <div className="page-header">
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {t('menu.softwareLicenses')}
            </Title>
            <Text type="secondary">
              {t('danhSachThietBiPhanMemPage.quan_ly_danh_sach_cac')}
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
              {t('danhSachThietBiPhanMemPage.them_ban_quyen')}
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} lg={8}>
              <Input
                placeholder={t('danhSachThietBiPhanMemPage.key_ban_quyen_ma')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                value={dateRangeMua}
                onChange={(dates) => setDateRangeMua(dates as any)}
                placeholder={[t('linhKienPhanCungPage.tu_ngay_mua'), t('linhKienPhanCungPage.den_ngay_mua')]}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                value={dateRangeHetHan}
                onChange={(dates) => setDateRangeHetHan(dates as any)}
                placeholder={[t('danhSachThietBiPhanMemPage.tu_ngay_het_han'), t('danhSachThietBiPhanMemPage.den_ngay_het_han')]}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Select
                placeholder={t('linhKienPhanCungPage.trang_thai_kho')}
                style={{ width: '100%' }}
                value={trangThaiKho}
                onChange={setTrangThaiKho}
                allowClear
                options={[
                  { value: 'TON_KHO', label: t('danhSachThietBiPhanMemPage.trong_kho_chua_dung') },
                  { value: 'CAP_PHAT', label: t('loaiTaiSanFormModal.dang_hoat_dong') },
                  { value: 'THANH_LY', label: t('danhSachThietBiPhanMemPage.da_huyhet_han') },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
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
            <Col xs={24} sm={12} lg={8}>
              <Space wrap style={{ width: '100%', justifyContent: 'flex-start' }}>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  {t('common.search')}
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
            scroll={{ x: 'max-content' }}
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
