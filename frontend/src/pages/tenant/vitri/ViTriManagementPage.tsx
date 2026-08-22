import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, Tooltip, message, Popconfirm, Dropdown, Row, Col, Select } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import { layDanhSach, themMoi, capNhat, xoaMem, capNhatTrangThai } from '../../../api-generated/endpoints/vi-tri-controller/vi-tri-controller';
import type { ViTriResponse } from '../../../api-generated/models/viTriResponse';
import type { ViTriRequest } from '../../../api-generated/models/viTriRequest';
import { ViTriFormModal } from './ViTriFormModal';

const { Title, Text } = Typography;

export const ViTriManagementPage: React.FC = observer(() => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [danhSachViTri, setDanhSachViTri] = useState<ViTriResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [searchTen, setSearchTen] = useState('');
  const [searchMa, setSearchMa] = useState('');
  const [searchTrangThai, setSearchTrangThai] = useState<string | undefined>(undefined);
  const [searchLoai, setSearchLoai] = useState<string | undefined>(undefined);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedViTri, setSelectedViTri] = useState<ViTriResponse | null>(null);

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await layDanhSach({
        page: page - 1,
        size,
        tenViTri: searchTen || undefined,
        maViTri: searchMa || undefined,
        trangThai: searchTrangThai || undefined,
        loaiViTri: searchLoai || undefined,
      });
      if (res.code === 200 && res.data) {
        setDanhSachViTri(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || t('viTriManagementPage.khong_the_tai_danh'));
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
    setSearchTrangThai(undefined);
    setSearchLoai(undefined);
    setCurrentPage(1);
    // Reload directly
    setLoading(true);
    layDanhSach({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSachViTri(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch((e) => message.error(t('viTriManagementPage.khong_the_tai_lai')))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: ViTriRequest) => {
    try {
      if (selectedViTri && selectedViTri.id) {
        const res = await capNhat(selectedViTri.id, values);
        if (res.code === 200) {
          message.success(t('viTriManagementPage.cap_nhat_vi_tri'));
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
        }
      } else {
        const res = await themMoi(values);
        if (res.code === 200) {
          message.success(t('viTriManagementPage.them_moi_vi_tri'));
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

  const handleToggleStatus = async (record: ViTriResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(t('viTriManagementPage.nextstatus_hoat_dong_t_vitrimanagementpage', { khoa: nextStatus === 'HOAT_DONG' ? t('viTriManagementPage.mo_khoa') : t('viTriManagementPage.khoa') }));
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('viTriManagementPage.cap_nhat_trang_thai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('viTriManagementPage.co_loi_xay_ra'));
    }
  };

  const handleXoaViTri = async (id: number) => {
    try {
      const res = await xoaMem(id);
      if (res.code === 200) {
        message.success(t('viTriManagementPage.xoa_vi_tri_thanh'));
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('viTriManagementPage.xoa_that_bai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('viTriManagementPage.khong_the_xoa_vi'));
    }
  };

  const renderLoaiViTri = (loai: string) => {
    switch (loai) {
      case 'KHO':
        return t('viTriManagementPage.kho_bai');
      case 'PHONG_MAY':
        return t('viTriManagementPage.phong_may_server');
      case 'KE_TU':
        return t('viTriManagementPage.ke_tu_rack');
      case 'VAN_PHONG':
        return t('viTriManagementPage.van_phong');
      default:
        return loai || t('viTriManagementPage.chua_phan_loai');
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
      title: t('viTriFormModal.ma_vi_tri'),
      dataIndex: 'maViTri',
      key: 'maViTri',
      width: 160,
      sorter: (a: any, b: any) => (a.maViTri || '').localeCompare(b.maViTri || ''),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: t('viTriManagementPage.ten_vi_tri'),
      dataIndex: 'tenViTri',
      key: 'tenViTri',
    },
    {
      title: t('viTriManagementPage.loai_vi_tri'),
      dataIndex: 'loaiViTri',
      key: 'loaiViTri',
      width: 180,
      render: (val: string) => renderLoaiViTri(val),
    },
    {
      title: t('viTriManagementPage.suc_chua_toi_da'),
      dataIndex: 'sucChuaToiDa',
      key: 'sucChuaToiDa',
      width: 140,
      render: (val: number) => val || t('viTriManagementPage.khong_gioi_han'),
    },
    {
      title: t('viTriManagementPage.dien_tich_m'),
      dataIndex: 'dienTichM2',
      key: 'dienTichM2',
      width: 130,
      render: (val: number) => val ? `${val} m²` : 'N/A',
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
      width: 110,
      render: (_: any, record: ViTriResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.SUA_VI_TRI)
            ? {
              key: 'edit',
              label: t('viTriManagementPage.cap_nhat'),
              icon: <EditOutlined />,
              onClick: () => {
                setSelectedViTri(record);
                setIsFormOpen(true);
              },
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_VI_TRI)
            ? {
              key: 'toggle_status',
              label: record.trangThai === 'HOAT_DONG' ? t('viTriManagementPage.khoa_vi_tri') : t('viTriManagementPage.kich_hoat'),
              icon: <SafetyOutlined />,
              onClick: () => handleToggleStatus(record),
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_VI_TRI)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title={t('viTriManagementPage.xac_nhan_xoa')}
                  description={t('viTriManagementPage.ban_co_chac_chan')}
                  okText={t('viTriManagementPage.xoa')}
                  cancelText={t('viTriManagementPage.huy')}
                  onConfirm={() => handleXoaViTri(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>{t('viTriManagementPage.xoa_vi_tri')}</span>
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_VI_TRI}>
      <div style={{ padding: 24 }}>
        <div className="page-header">
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {t('viTriManagementPage.quan_ly_vi_tri_kho_bai')}
            </Title>
            <Text type="secondary">
              {t('viTriManagementPage.danh_sach_cac_vi_tri')}
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_VI_TRI}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedViTri(null);
                setIsFormOpen(true);
              }}
            >
              {t('viTriManagementPage.them_vi_tri')}
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Input
                placeholder={t('viTriManagementPage.tim_ten_vi_tri')}
                value={searchTen}
                onChange={(e) => setSearchTen(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={6}>
              <Input
                placeholder={t('viTriManagementPage.ma_vi_tri')}
                value={searchMa}
                onChange={(e) => setSearchMa(e.target.value)}
              />
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder={t('viTriManagementPage.loai_vi_tri')}
                style={{ width: '100%' }}
                value={searchLoai}
                onChange={setSearchLoai}
                allowClear
                options={[
                  { value: 'KHO', label: t('viTriManagementPage.kho_bai') },
                  { value: 'PHONG_MAY', label: t('viTriManagementPage.phong_may') },
                  { value: 'KE_TU', label: t('viTriManagementPage.ke_tu') },
                  { value: 'VAN_PHONG', label: t('viTriManagementPage.van_phong') },
                ]}
              />
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder={t('loaiTaiSanFormModal.trang_thai')}
                style={{ width: '100%' }}
                value={searchTrangThai}
                onChange={setSearchTrangThai}
                allowClear
                options={[
                  { value: 'HOAT_DONG', label: t('loaiTaiSanFormModal.dang_hoat_dong') },
                  { value: 'KHOA', label: t('loaiTaiSanFormModal.tam_khoa') },
                ]}
              />
            </Col>
            <Col xs={24} md={4}>
              <Space>
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
            dataSource={danhSachViTri}
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

        <ViTriFormModal
          open={isFormOpen}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedViTri(null);
          }}
          selectedViTri={selectedViTri}
          onSave={handleSaveForm}
        />
      </div>
    </QuyenHanGuard>
  );
});

export default ViTriManagementPage;
