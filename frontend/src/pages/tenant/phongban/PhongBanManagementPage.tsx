import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, Tooltip, message, Popconfirm, Dropdown, Row, Col, Select } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import { layDanhSach6, themMoi6, capNhat6, xoaMem6, capNhatTrangThai6 } from '../../../api-generated/endpoints/phong-ban-controller/phong-ban-controller';
import type { PhongBanResponse } from '../../../api-generated/models/phongBanResponse';
import type { PhongBanRequest } from '../../../api-generated/models/phongBanRequest';
import { PhongBanFormModal } from './PhongBanFormModal';

const { Title, Text } = Typography;

export const PhongBanManagementPage: React.FC = observer(() => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [danhSachPhongBan, setDanhSachPhongBan] = useState<PhongBanResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [searchTen, setSearchTen] = useState('');
  const [searchMa, setSearchMa] = useState('');
  const [searchTrangThai, setSearchTrangThai] = useState<string | undefined>(undefined);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPhongBan, setSelectedPhongBan] = useState<PhongBanResponse | null>(null);

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await layDanhSach6({
        page: page - 1,
        size,
        tenPhongBan: searchTen || undefined,
        maPhongBan: searchMa || undefined,
        trangThai: searchTrangThai || undefined,
      });
      if (res.code === 200 && res.data) {
        setDanhSachPhongBan(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || t('phongBanManagementPage.khong_the_tai_danh'));
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
    setCurrentPage(1);
    // Reload directly
    setLoading(true);
    layDanhSach6({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSachPhongBan(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch((e) => message.error(t('viTriManagementPage.khong_the_tai_lai')))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: PhongBanRequest) => {
    try {
      if (selectedPhongBan && selectedPhongBan.id) {
        const res = await capNhat6(selectedPhongBan.id, values);
        if (res.code === 200) {
          message.success(t('phongBanManagementPage.cap_nhat_phong_ban'));
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
        }
      } else {
        const res = await themMoi6(values);
        if (res.code === 200) {
          message.success(t('phongBanManagementPage.them_moi_phong_ban'));
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

  const handleToggleStatus = async (record: PhongBanResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai6(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(t('phongBanManagementPage.nextstatus_hoat_dong_t_vitrimanagementpage', { khoa: nextStatus === 'HOAT_DONG' ? t('viTriManagementPage.kich_hoat') : t('viTriManagementPage.khoa') }));
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('viTriManagementPage.cap_nhat_trang_thai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('viTriManagementPage.co_loi_xay_ra'));
    }
  };

  const handleXoaPhongBan = async (id: number) => {
    try {
      const res = await xoaMem6(id);
      if (res.code === 200) {
        message.success(t('phongBanManagementPage.xoa_phong_ban_thanh'));
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('viTriManagementPage.xoa_that_bai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('phongBanManagementPage.khong_the_xoa_phong'));
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
      title: t('phongBanFormModal.ma_phong_ban'),
      dataIndex: 'maPhongBan',
      key: 'maPhongBan',
      width: 160,
      sorter: (a: any, b: any) => (a.maPhongBan || '').localeCompare(b.maPhongBan || ''),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: t('phongBanManagementPage.ten_phong_ban'),
      dataIndex: 'tenPhongBan',
      key: 'tenPhongBan',
    },
    {
      title: t('phongBanManagementPage.ten_viet_tat'),
      dataIndex: 'tenVietTat',
      key: 'tenVietTat',
      width: 140,
    },
    {
      title: t('phongBanManagementPage.email_nhom'),
      dataIndex: 'emailNhom',
      key: 'emailNhom',
    },
    {
      title: t('phongBanManagementPage.hotline_phong'),
      dataIndex: 'soHotlinePhong',
      key: 'soHotlinePhong',
      width: 150,
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
      render: (_: any, record: PhongBanResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.SUA_PHONG_BAN)
            ? {
              key: 'edit',
              label: t('viTriManagementPage.cap_nhat'),
              icon: <EditOutlined />,
              onClick: () => {
                setSelectedPhongBan(record);
                setIsFormOpen(true);
              },
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_PHONG_BAN)
            ? {
              key: 'toggle_status',
              label: record.trangThai === 'HOAT_DONG' ? t('phongBanManagementPage.khoa_phong_ban') : t('viTriManagementPage.kich_hoat'),
              icon: <SafetyOutlined />,
              onClick: () => handleToggleStatus(record),
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_PHONG_BAN)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title={t('viTriManagementPage.xac_nhan_xoa')}
                  description={t('phongBanManagementPage.ban_co_chac_chan')}
                  okText={t('viTriManagementPage.xoa')}
                  cancelText={t('viTriManagementPage.huy')}
                  onConfirm={() => handleXoaPhongBan(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>{t('phongBanManagementPage.xoa_phong_ban')}</span>
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_PHONG_BAN}>
      <div style={{ padding: 24 }}>
        <div className="page-header">
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {t('phongBanManagementPage.quan_ly_phong_ban')}
            </Title>
            <Text type="secondary">
              {t('phongBanManagementPage.danh_sach_phong_ban_bo')}
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_PHONG_BAN}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedPhongBan(null);
                setIsFormOpen(true);
              }}
            >
              {t('phongBanManagementPage.them_phong_ban')}
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Input
                placeholder={t('phongBanManagementPage.tim_ten_phong_ban')}
                value={searchTen}
                onChange={(e) => setSearchTen(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={8}>
              <Input
                placeholder={t('phongBanManagementPage.ma_phong_ban')}
                value={searchMa}
                onChange={(e) => setSearchMa(e.target.value)}
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
            dataSource={danhSachPhongBan}
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

        <PhongBanFormModal
          open={isFormOpen}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedPhongBan(null);
          }}
          selectedPhongBan={selectedPhongBan}
          onSave={handleSaveForm}
        />
      </div>
    </QuyenHanGuard>
  );
});

export default PhongBanManagementPage;
