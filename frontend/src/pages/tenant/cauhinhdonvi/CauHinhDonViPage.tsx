import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, Tooltip, message, Popconfirm, Dropdown, Row, Col } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import { layDanhSach26, themMoi26, capNhat25, xoaMem26 } from '../../../api-generated/endpoints/cau-hinh-don-vi-controller/cau-hinh-don-vi-controller';
import type { CauHinhDonViResponse } from '../../../api-generated/models/cauHinhDonViResponse';
import type { CauHinhDonViRequest } from '../../../api-generated/models/cauHinhDonViRequest';
import { CauHinhDonViFormModal } from './CauHinhDonViFormModal';

const { Title, Text } = Typography;

export const CauHinhDonViPage: React.FC = observer(() => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [danhSachCauHinh, setDanhSachCauHinh] = useState<CauHinhDonViResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [searchTen, setSearchTen] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CauHinhDonViResponse | null>(null);

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await layDanhSach26({
        page: page - 1,
        size,
        tenCauHinh: searchTen || undefined,
      });
      if (res.code === 200 && res.data) {
        setDanhSachCauHinh(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || t('cauHinhDonViPage.khong_the_tai_danh'));
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
    setCurrentPage(1);
    // Reload directly
    setLoading(true);
    layDanhSach26({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSachCauHinh(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch((e) => message.error(t('viTriManagementPage.khong_the_tai_lai')))
      .finally(() => setLoading(false));
  };

  const handleSaveForm = async (values: CauHinhDonViRequest) => {
    try {
      if (selectedRecord && selectedRecord.id) {
        const res = await capNhat25(selectedRecord.id, values);
        if (res.code === 200) {
          message.success(t('cauHinhDonViPage.cap_nhat_cau_hinh'));
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
        }
      } else {
        const res = await themMoi26(values);
        if (res.code === 200) {
          message.success(t('cauHinhDonViPage.them_cau_hinh_rieng'));
          setIsFormOpen(false);
          taiDuLieu(currentPage, pageSize);
        } else {
          message.error(res.message || t('cauHinhDonViPage.luu_that_bai'));
        }
      }
    } catch (e: any) {
      message.error(e?.message || t('danhMucCauHinhPage.co_loi_xay_ra'));
    }
  };

  const handleXoaCauHinh = async (id: number) => {
    try {
      const res = await xoaMem26(id);
      if (res.code === 200) {
        message.success(t('danhMucCauHinhPage.xoa_cau_hinh_thanh'));
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('viTriManagementPage.xoa_that_bai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('danhMucCauHinhPage.khong_the_xoa_cau'));
    }
  };

  const columns = [
    {
      title: t('danhMucCauHinhPage.ma_cau_hinh'),
      dataIndex: 'maCauHinh',
      key: 'maCauHinh',
      width: 220,
    },
    {
      title: t('danhMucCauHinhPage.ten_cau_hinh'),
      dataIndex: 'tenCauHinh',
      key: 'tenCauHinh',
    },
    {
      title: t('cauHinhDonViPage.gia_tri_cau_hinh'),
      dataIndex: 'giaTriCauHinh',
      key: 'giaTriCauHinh',
    },
    {
      title: t('viTriManagementPage.hanh_dong'),
      key: 'hanhDong',
      width: 110,
      render: (_: any, record: CauHinhDonViResponse) => {
        const items: MenuProps['items'] = [
          authStore.kiemTraQuyen(QUYEN.SUA_CAU_HINH_DON_VI)
            ? {
              key: 'edit',
              label: t('viTriManagementPage.cap_nhat'),
              icon: <EditOutlined />,
              onClick: () => {
                setSelectedRecord(record);
                setIsFormOpen(true);
              },
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_CAU_HINH_DON_VI)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title={t('viTriManagementPage.xac_nhan_xoa')}
                  description={t('cauHinhDonViPage.ban_co_chac_chan')}
                  okText={t('viTriManagementPage.xoa')}
                  cancelText={t('viTriManagementPage.huy')}
                  onConfirm={() => handleXoaCauHinh(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>{t('danhMucCauHinhPage.xoa_cau_hinh')}</span>
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_CAU_HINH_DON_VI}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {t('cauHinhDonViPage.cau_hinh_don_vi')}
            </Title>
            <Text type="secondary">
              {t('cauHinhDonViPage.thiet_lap_cac_thong_so')}
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_CAU_HINH_DON_VI}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedRecord(null);
                setIsFormOpen(true);
              }}
            >
              {t('cauHinhDonViPage.them_cau_hinh')}
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Input
                placeholder={t('cauHinhDonViPage.tim_kiem_theo_ten')}
                value={searchTen}
                onChange={(e) => setSearchTen(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={8}>
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
            dataSource={danhSachCauHinh}
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

        <CauHinhDonViFormModal
          open={isFormOpen}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedRecord(null);
          }}
          selectedRecord={selectedRecord}
          onSave={handleSaveForm}
        />
      </div>
    </QuyenHanGuard>
  );
});

export default CauHinhDonViPage;
