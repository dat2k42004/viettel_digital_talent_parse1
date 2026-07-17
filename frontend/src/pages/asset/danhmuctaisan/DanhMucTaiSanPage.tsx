import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import {
  layDanhSach24,
  themMoi24,
  capNhat23,
  capNhatTrangThai15,
  xoaMem24,
} from '../../../api-generated/endpoints/danh-muc-tai-san-controller/danh-muc-tai-san-controller';
import type { DanhMucTaiSanResponse } from '../../../api-generated/models/danhMucTaiSanResponse';
import type { DanhMucTaiSanRequest } from '../../../api-generated/models/danhMucTaiSanRequest';
import { DanhMucTaiSanFormModal } from './DanhMucTaiSanFormModal';

const { Title, Text } = Typography;

export const DanhMucTaiSanPage: React.FC = observer(() => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [danhSach, setDanhSach] = useState<DanhMucTaiSanResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [trangThai, setTrangThai] = useState<string | undefined>(undefined);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DanhMucTaiSanResponse | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await layDanhSach24({
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
      message.error(e?.message || t('danhMucTaiSanPage.khong_the_tai_danh'));
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
    layDanhSach24({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSach(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch(() => message.error(t('viTriManagementPage.khong_the_tai_lai')))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: DanhMucTaiSanRequest) => {
    try {
      if (selectedItem && selectedItem.id) {
        const res = await capNhat23(selectedItem.id, values);
        if (res.code === 200) {
          message.success(t('danhMucTaiSanPage.cap_nhat_danh_muc'));
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
        }
      } else {
        const res = await themMoi24(values);
        if (res.code === 200) {
          message.success(t('danhMucTaiSanPage.them_moi_danh_muc'));
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

  const handleToggleStatus = async (record: DanhMucTaiSanResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai15(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(t('danhMucTaiSanPage.nextstatus_hoat_dong_t_vitrimanagementpage', { khoa: nextStatus === 'HOAT_DONG' ? t('viTriManagementPage.kich_hoat') : t('viTriManagementPage.khoa') }));
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
      const res = await xoaMem24(id);
      if (res.code === 200) {
        message.success(t('danhMucTaiSanPage.xoa_danh_muc_tai'));
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('viTriManagementPage.xoa_that_bai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('danhMucTaiSanPage.khong_the_xoa_danh'));
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
      title: t('baoCaoPage.ma_danh_muc'),
      dataIndex: 'maDanhMuc',
      key: 'maDanhMuc',
      width: 150,
      sorter: (a: any, b: any) => (a.maDanhMuc || '').localeCompare(b.maDanhMuc || ''),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: t('danhMucTaiSanPage.ten_danh_muc'),
      dataIndex: 'tenDanhMuc',
      key: 'tenDanhMuc',
    },
    {
      title: t('roleManagementPage.mo_ta'),
      dataIndex: 'moTa',
      key: 'moTa',
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
      render: (_: any, record: DanhMucTaiSanResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.XEM_DANH_MUC_TAI_SAN)
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
          authStore.kiemTraQuyen(QUYEN.SUA_DANH_MUC_TAI_SAN)
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
          authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_DANH_MUC_TAI_SAN)
            ? {
              key: 'toggle_status',
              label: record.trangThai === 'HOAT_DONG' ? t('danhMucTaiSanPage.khoa_danh_muc') : t('viTriManagementPage.kich_hoat'),
              icon: <SafetyOutlined />,
              onClick: () => handleToggleStatus(record),
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_DANH_MUC_TAI_SAN)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title={t('viTriManagementPage.xac_nhan_xoa')}
                  description={t('danhMucTaiSanPage.ban_co_chac_chan')}
                  okText={t('viTriManagementPage.xoa')}
                  cancelText={t('viTriManagementPage.huy')}
                  onConfirm={() => handleXoa(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>{t('danhMucTaiSanPage.xoa_danh_muc')}</span>
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_DANH_MUC_TAI_SAN}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {t('menu.assetCategories')}
            </Title>
            <Text type="secondary">
              {t('danhMucTaiSanPage.phan_loai_tai_san_theo')}
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_DANH_MUC_TAI_SAN}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedItem(null);
                setFormMode('add');
                setIsFormOpen(true);
              }}
            >
              {t('danhMucTaiSanPage.them_danh_muc')}
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Input
                placeholder={t('danhMucTaiSanPage.tim_kiem_theo_ma')}
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

        <DanhMucTaiSanFormModal
          open={isFormOpen}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedItem(null);
          }}
          selectedDanhMucTaiSan={selectedItem}
          mode={formMode}
          onSave={handleSaveForm}
        />
      </div>
    </QuyenHanGuard>
  );
});

export default DanhMucTaiSanPage;
