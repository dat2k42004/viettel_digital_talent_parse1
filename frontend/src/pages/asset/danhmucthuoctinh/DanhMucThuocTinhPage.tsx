import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      message.error(e?.message || t('danhMucThuocTinhPage.khong_the_tai_danh'));
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
      .catch(() => message.error(t('viTriManagementPage.khong_the_tai_lai')))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: DanhMucThuocTinhRequest) => {
    try {
      if (selectedItem && selectedItem.id) {
        const res = await capNhat22(selectedItem.id, values);
        if (res.code === 200) {
          message.success(t('danhMucThuocTinhPage.cap_nhat_thuoc_tinh'));
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
        }
      } else {
        const res = await themMoi23(values);
        if (res.code === 200) {
          message.success(t('danhMucThuocTinhPage.them_moi_thuoc_tinh'));
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

  const handleToggleStatus = async (record: DanhMucThuocTinhResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai14(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(t('danhMucThuocTinhPage.nextstatus_hoat_dong_t_vitrimanagementpage', { khoa: nextStatus === 'HOAT_DONG' ? t('viTriManagementPage.kich_hoat') : t('viTriManagementPage.khoa') }));
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
      const res = await xoaMem23(id);
      if (res.code === 200) {
        message.success(t('danhMucThuocTinhPage.xoa_thuoc_tinh_thanh'));
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('viTriManagementPage.xoa_that_bai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('danhMucThuocTinhPage.khong_the_xoa_thuoc'));
    }
  };

  const renderApDungCho = (val: string) => {
    switch (val) {
      case 'PHAN_CUNG':
        return <Tag color="blue">{t('phieuSuaChuaFormModal.thiet_bi_phan_cung')}</Tag>;
      case 'PHAN_MEM':
        return <Tag color="purple">{t('phieuThanhLyFormModal.ban_quyen_phan_mem')}</Tag>;
      case 'LINH_KIEN':
        return <Tag color="orange">{t('phieuCapPhatFormModal.linh_kien_phan_cung')}</Tag>;
      default:
        return <Tag>{val}</Tag>;
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'HOAT_DONG':
        return <Tag color="green">{t('loaiTaiSanFormModal.dang_hoat_dong')}</Tag>;
      case 'KHOA':
        return <Tag color="red">{t('loaiTaiSanFormModal.tam_khoa')}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: t('danhMucThuocTinhPage.ma_thuoc_tinh'),
      dataIndex: 'maThuocTinh',
      key: 'maThuocTinh',
      width: 140,
      sorter: (a: any, b: any) => (a.maThuocTinh || '').localeCompare(b.maThuocTinh || ''),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: t('danhMucThuocTinhPage.ten_thuoc_tinh'),
      dataIndex: 'tenThuocTinh',
      key: 'tenThuocTinh',
    },
    {
      title: t('danhMucThuocTinhPage.kieu_du_lieu'),
      dataIndex: 'kieuDuLieu',
      key: 'kieuDuLieu',
      width: 110,
      render: (val: string) => <Tag color="cyan">{val}</Tag>,
    },
    {
      title: t('danhMucThuocTinhPage.ap_dung_cho'),
      dataIndex: 'apDungCho',
      key: 'apDungCho',
      width: 180,
      render: (val: string) => renderApDungCho(val),
    },
    {
      title: t('danhMucThuocTinhPage.bat_buoc_1'),
      dataIndex: 'batBuocNhap',
      key: 'batBuocNhap',
      width: 110,
      render: (val: boolean) => val ? <Tag color="red">{t('danhMucThuocTinhPage.bat_buoc')}</Tag> : <Tag color="default">{t('danhMucThuocTinhPage.tuy_chon')}</Tag>,
    },
    {
      title: t('danhMucCauHinhPage.gia_tri_mac_dinh'),
      dataIndex: 'giaTriMacDinh',
      key: 'giaTriMacDinh',
      width: 140,
      render: (val: string) => val || '-',
    },
    {
      title: t('loaiTaiSanFormModal.trang_thai'),
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 140,
      render: (val: string) => renderStatus(val),
    },
    {
      title: t('viTriManagementPage.hanh_dong'),
      key: 'hanhDong',
      width: 120,
      render: (_: any, record: DanhMucThuocTinhResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.XEM_DANH_MUC_THUOC_TINH)
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
          authStore.kiemTraQuyen(QUYEN.SUA_DANH_MUC_THUOC_TINH)
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
          authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_DANH_MUC_THUOC_TINH)
            ? {
              key: 'toggle_status',
              label: record.trangThai === 'HOAT_DONG' ? t('danhMucThuocTinhPage.khoa_thuoc_tinh') : t('viTriManagementPage.kich_hoat'),
              icon: <SafetyOutlined />,
              onClick: () => handleToggleStatus(record),
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_DANH_MUC_THUOC_TINH)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title={t('viTriManagementPage.xac_nhan_xoa')}
                  description={t('danhMucThuocTinhPage.ban_co_chac_chan')}
                  okText={t('viTriManagementPage.xoa')}
                  cancelText={t('viTriManagementPage.huy')}
                  onConfirm={() => handleXoa(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>{t('danhMucThuocTinhPage.xoa_thuoc_tinh')}</span>
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
                placeholder={t('danhMucThuocTinhPage.tim_kiem_theo_ma')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder={t('danhMucThuocTinhPage.ap_dung_cho_phan')}
                style={{ width: '100%' }}
                value={apDungCho}
                onChange={setApDungCho}
                allowClear
                options={[
                  { value: 'PHAN_CUNG', label: t('danhMucThuocTinhPage.thiet_bi_phan_cung') },
                  { value: 'PHAN_MEM', label: t('danhMucThuocTinhPage.ban_quyen_phan_mem') },
                  { value: 'LINH_KIEN', label: t('danhMucThuocTinhPage.linh_kien_phan_cung') },
                ]}
              />
            </Col>
            <Col xs={24} md={6}>
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
