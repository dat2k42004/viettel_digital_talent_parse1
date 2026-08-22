import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      message.error(e?.message || t('taiSanPhanMemPage.khong_the_tai_danh'));
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
      .catch(() => message.error(t('viTriManagementPage.khong_the_tai_lai')))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: TaiSanPhanMemRequest) => {
    try {
      if (selectedItem && selectedItem.id) {
        const res = await capNhat4(selectedItem.id, values);
        if (res.code === 200) {
          message.success(t('taiSanPhanMemPage.cap_nhat_mau_phan'));
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
        }
      } else {
        const res = await themMoi4(values);
        if (res.code === 200) {
          message.success(t('taiSanPhanMemPage.them_moi_mau_phan'));
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

  const handleToggleStatus = async (record: TaiSanPhanMemResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai4(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(t('taiSanPhanMemPage.nextstatus_hoat_dong_t_vitrimanagementpage', { khoa: nextStatus === 'HOAT_DONG' ? t('viTriManagementPage.kich_hoat') : t('viTriManagementPage.khoa') }));
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
      const res = await xoaMem4(id);
      if (res.code === 200) {
        message.success(t('taiSanPhanMemPage.xoa_mau_phan_mem'));
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('viTriManagementPage.xoa_that_bai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('taiSanPhanMemPage.khong_the_xoa_mau'));
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
      title: t('taiSanPhanMemPage.ma_mau'),
      dataIndex: 'maMau',
      key: 'maMau',
      width: 120,
      sorter: (a: any, b: any) => (a.maMau || '').localeCompare(b.maMau || ''),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: t('danhSachThietBiPhanCungPage.ten_mau'),
      dataIndex: 'tenMau',
      key: 'tenMau',
    },
    {
      title: t('taiSanPhanMemPage.hang_san_xuat'),
      dataIndex: 'tenHangSanXuat',
      key: 'tenHangSanXuat',
    },
    {
      title: t('baoCaoPage.loai_tai_san'),
      dataIndex: 'tenLoaiTaiSan',
      key: 'tenLoaiTaiSan',
    },
    {
      title: t('taiSanPhanMemPage.hinh_thuc_trien_khai'),
      dataIndex: 'hinhThucTrienKhai',
      key: 'hinhThucTrienKhai',
    },
    {
      title: t('taiSanPhanMemPage.hinh_thuc_cap_phep'),
      dataIndex: 'hinhThucCapPhep',
      key: 'hinhThucCapPhep',
    },
    {
      title: t('taiSanPhanMemPage.nen_tang_ho_tro'),
      dataIndex: 'nenTangHoTro',
      key: 'nenTangHoTro',
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
      render: (_: any, record: TaiSanPhanMemResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.XEM_TAI_SAN_PHAN_MEM)
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
          authStore.kiemTraQuyen(QUYEN.SUA_TAI_SAN_PHAN_MEM)
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
          authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_TAI_SAN_PHAN_MEM)
            ? {
              key: 'toggle_status',
              label: record.trangThai === 'HOAT_DONG' ? t('taiSanPhanMemPage.khoa_mau') : t('viTriManagementPage.kich_hoat'),
              icon: <SafetyOutlined />,
              onClick: () => handleToggleStatus(record),
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_TAI_SAN_PHAN_MEM)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title={t('viTriManagementPage.xac_nhan_xoa')}
                  description={t('taiSanPhanMemPage.ban_co_chac_chan')}
                  okText={t('viTriManagementPage.xoa')}
                  cancelText={t('viTriManagementPage.huy')}
                  onConfirm={() => handleXoa(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>{t('taiSanPhanMemPage.xoa_mau')}</span>
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_TAI_SAN_PHAN_MEM}>
      <div style={{ padding: 24 }}>
        <div className="page-header">
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {t('menu.softwareModels')}
            </Title>
            <Text type="secondary">
              {t('taiSanPhanMemPage.quan_ly_danh_sach_cac')}
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
              {t('taiSanPhanMemPage.them_mau_phan_mem')}
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Input
                placeholder={t('taiSanPhanMemPage.tim_kiem_theo_ma')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder={t('loaiTaiSanFormModal.trang_thai')}
                style={{ width: '100%' }}
                value={trangThai}
                onChange={setTrangThai}
                allowClear
                options={[
                  { value: 'HOAT_DONG', label: t('loaiTaiSanFormModal.dang_hoat_dong') },
                  { value: 'KHOA', label: t('loaiTaiSanFormModal.tam_khoa') },
                ]}
              />
            </Col>
            <Col xs={24} md={6}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>{t('common.search')}</Button>
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
