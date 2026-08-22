import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, Tooltip, message, Popconfirm, Dropdown, Row, Col, Select, Descriptions, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import { layDanhSach29, layTheoId21, capNhatThongTin, xoaMem21, capNhatTrangThai13, giaHanHopDong, dangKyDonVi } from '../../../api-generated/endpoints/don-vi-controller/don-vi-controller';
import type { DonViResponse } from '../../../api-generated/models/donViResponse';
import type { DonViUpdateRequest } from '../../../api-generated/models/donViUpdateRequest';
import type { GiaHanHopDongRequest } from '../../../api-generated/models/giaHanHopDongRequest';
import type { DangKyDonViRequest } from '../../../api-generated/models/dangKyDonViRequest';
import { DonViFormModal } from './DonViFormModal';
import { DonViGiaHanModal } from './DonViGiaHanModal';
import { DonViCreateModal } from './DonViCreateModal';

const { Title, Text } = Typography;

export const DonViManagementPage: React.FC = observer(() => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [danhSachDonVi, setDanhSachDonVi] = useState<DonViResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [searchTen, setSearchTen] = useState('');
  const [searchMa, setSearchMa] = useState('');
  const [searchTrangThai, setSearchTrangThai] = useState<string | undefined>(undefined);
  const [searchMaSoThue, setSearchMaSoThue] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGiaHanOpen, setIsGiaHanOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedDonVi, setSelectedDonVi] = useState<DonViResponse | null>(null);
  const [detailDonVi, setDetailDonVi] = useState<DonViResponse | null>(null);

  const handleCreateDonVi = async (values: DangKyDonViRequest) => {
    setCreateLoading(true);
    try {
      const res = await dangKyDonVi(values);
      if (res.code === 200) {
        message.success(t('donViManagementPage.tao_don_vi_thanh'));
        setIsCreateOpen(false);
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('donViManagementPage.tao_don_vi_that'));
      }
    } catch (e: any) {
      message.error(e?.message || t('donViManagementPage.co_loi_xay_ra_khi_tao_don_vi'));
    } finally {
      setCreateLoading(false);
    }
  };

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await layDanhSach29({
        page: page - 1,
        size,
        ten: searchTen || undefined,
        maDonVi: searchMa || undefined,
        trangThai: searchTrangThai || undefined,
        maSoThue: searchMaSoThue || undefined,
      });
      if (res.code === 200 && res.data) {
        setDanhSachDonVi(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || t('donViManagementPage.khong_the_tai_danh'));
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
    setSearchMaSoThue('');
    setCurrentPage(1);
    // Directly call API with empty filters
    setLoading(true);
    layDanhSach29({ page: 0, size: pageSize })
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDanhSachDonVi(res.data.content || []);
          setTotalCount(res.data.page_info?.total_elements || 0);
        }
      })
      .catch((e) => message.error(t('viTriManagementPage.khong_the_tai_lai')))
      .finally(() => setLoading(false));
  };

  const handleOpenDetail = async (id: number) => {
    try {
      const res = await layTheoId21(id);
      if (res.code === 200 && res.data) {
        setDetailDonVi(res.data);
        setIsDetailOpen(true);
      }
    } catch (e: any) {
      message.error(e?.message || t('donViManagementPage.khong_the_lay_thong'));
    }
  };

  const handleSaveForm = async (values: DonViUpdateRequest) => {
    if (!selectedDonVi || !selectedDonVi.id) return;
    try {
      const res = await capNhatThongTin(selectedDonVi.id, values);
      if (res.code === 200) {
        message.success(t('donViManagementPage.cap_nhat_thong_tin'));
        setIsFormOpen(false);
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('donViManagementPage.co_loi_xay_ra_khi_cap_nhat'));
    }
  };

  const handleGiaHan = async (values: GiaHanHopDongRequest) => {
    if (!selectedDonVi || !selectedDonVi.id) return;
    try {
      const res = await giaHanHopDong(selectedDonVi.id, values);
      if (res.code === 200) {
        message.success(t('donViManagementPage.gia_han_hop_dong'));
        setIsGiaHanOpen(false);
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('donViManagementPage.gia_han_that_bai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('donViManagementPage.co_loi_xay_ra_khi_gia_han'));
    }
  };

  const handleToggleStatus = async (record: DonViResponse) => {
    if (!record.id) return;
    const currentStatus = record.trangThai || 'HOAT_DONG';
    const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    try {
      const res = await capNhatTrangThai13(record.id, { trangThai: nextStatus });
      if (res.code === 200) {
        message.success(t('donViManagementPage.nextstatus_hoat_dong_t_vitrimanagementpage', { khoa: nextStatus === 'HOAT_DONG' ? t('viTriManagementPage.mo_khoa') : t('viTriManagementPage.khoa') }));
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('donViManagementPage.thay_doi_trang_thai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('viTriManagementPage.co_loi_xay_ra'));
    }
  };

  const handleXoaDonVi = async (id: number) => {
    try {
      const res = await xoaMem21(id);
      if (res.code === 200) {
        message.success(t('donViManagementPage.xoa_don_vi_thanh'));
        taiDuLieu(currentPage, pageSize);
      } else {
        message.error(res.message || t('viTriManagementPage.xoa_that_bai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('donViManagementPage.khong_the_xoa_don'));
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'HOAT_DONG':
        return <Tag color="green">{t('loaiTaiSanFormModal.dang_hoat_dong')}</Tag>;
      case 'KHOA':
        return <Tag color="red">{t('donViManagementPage.da_tam_khoa')}</Tag>;
      case 'CHO_XAC_THUC':
        return <Tag color="orange">{t('donViManagementPage.cho_xac_thuc')}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: t('donViManagementPage.ma_don_vi'),
      dataIndex: 'maDonVi',
      key: 'maDonVi',
      width: 140,
      sorter: (a: any, b: any) => (a.maDonVi || '').localeCompare(b.maDonVi || ''),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: t('donViManagementPage.ten_phap_ly'),
      dataIndex: 'tenPhapLy',
      key: 'tenPhapLy',
    },
    {
      title: t('donViManagementPage.ma_so_thue'),
      dataIndex: 'maSoThue',
      key: 'maSoThue',
      width: 120,
    },
    {
      title: t('donViManagementPage.ten_mien'),
      dataIndex: 'tenMienHeThong',
      key: 'tenMienHeThong',
    },
    {
      title: t('loaiTaiSanFormModal.trang_thai'),
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 140,
      render: (val: string) => renderStatus(val),
    },
    {
      title: t('donViManagementPage.han_hop_dong'),
      dataIndex: 'thoiGianHetHanHopDong',
      key: 'thoiGianHetHanHopDong',
      width: 130,
      render: (val: string) => val ? new Date(val).toLocaleDateString('vi-VN') : t('viTriManagementPage.khong_gioi_han'),
    },
    {
      title: t('viTriManagementPage.hanh_dong'),
      key: 'hanhDong',
      width: 110,
      render: (_: any, record: DonViResponse) => {
        const items: MenuProps['items'] = [
          {
            key: 'detail',
            label: t('donViManagementPage.xem_chi_tiet'),
            icon: <EyeOutlined />,
            onClick: () => handleOpenDetail(record.id!),
          },
          authStore.kiemTraQuyen(QUYEN.SUA_DON_VI)
            ? {
              key: 'edit',
              label: t('viTriManagementPage.cap_nhat'),
              icon: <EditOutlined />,
              onClick: () => {
                setSelectedDonVi(record);
                setIsFormOpen(true);
              },
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.KHOA_DON_VI) && authStore.laSuperAdmin
            ? {
              key: 'toggle_status',
              label: record.trangThai === 'HOAT_DONG' ? t('donViManagementPage.khoa_don_vi') : t('viTriManagementPage.mo_khoa'),
              icon: <SafetyOutlined />,
              onClick: () => handleToggleStatus(record),
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.GIA_HAN_DON_VI) && authStore.laSuperAdmin
            ? {
              key: 'gia_han',
              label: t('donViManagementPage.gia_han'),
              icon: <PlusOutlined />,
              onClick: () => {
                setSelectedDonVi(record);
                setIsGiaHanOpen(true);
              },
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XOA_DON_VI)
            ? {
              key: 'delete',
              label: (
                <Popconfirm
                  title={t('viTriManagementPage.xac_nhan_xoa')}
                  description={t('donViManagementPage.ban_co_chac_chan')}
                  okText={t('viTriManagementPage.xoa')}
                  cancelText={t('viTriManagementPage.huy')}
                  onConfirm={() => handleXoaDonVi(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>{t('donViManagementPage.xoa_don_vi')}</span>
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
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_DON_VI}>
      <div style={{ padding: 24 }}>
        <div className="page-header">
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {t('donViManagementPage.quan_tri_don_vi_da')}
            </Title>
            <Text type="secondary">
              {t('donViManagementPage.danh_sach_quan_ly_toan')}
            </Text>
          </div>
          {(authStore.laSuperAdmin || authStore.kiemTraQuyen(QUYEN.SUA_DON_VI)) && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateOpen(true)}
            >
              {t('donViManagementPage.them_moi_don_vi')}
            </Button>
          )}
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Input
                placeholder={t('donViManagementPage.tim_ten_phap_ly')}
                value={searchTen}
                onChange={(e) => setSearchTen(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={5}>
              <Input
                placeholder={t('donViManagementPage.ma_don_vi_1')}
                value={searchMa}
                onChange={(e) => setSearchMa(e.target.value)}
              />
            </Col>
            <Col xs={24} md={5}>
              <Input
                placeholder={t('donViManagementPage.ma_so_thue_1')}
                value={searchMaSoThue}
                onChange={(e) => setSearchMaSoThue(e.target.value)}
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
                  { value: 'CHO_XAC_THUC', label: t('donViManagementPage.cho_xac_thuc') },
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
            dataSource={danhSachDonVi}
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

        <DonViFormModal
          open={isFormOpen}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedDonVi(null);
          }}
          selectedDonVi={selectedDonVi}
          onSave={handleSaveForm}
        />

        <DonViGiaHanModal
          open={isGiaHanOpen}
          onCancel={() => {
            setIsGiaHanOpen(false);
            setSelectedDonVi(null);
          }}
          onSave={handleGiaHan}
        />

        <DonViCreateModal
          open={isCreateOpen}
          onCancel={() => setIsCreateOpen(false)}
          onSave={handleCreateDonVi}
          loading={createLoading}
        />

        <Modal
          title={t('donViManagementPage.thong_tin_chi_tiet')}
          open={isDetailOpen}
          onCancel={() => {
            setIsDetailOpen(false);
            setDetailDonVi(null);
          }}
          footer={[
            <Button key="close" onClick={() => setIsDetailOpen(false)}>{t('common.close')}</Button>,
          ]}
          width={700}
        >
          {detailDonVi && (
            <Descriptions bordered column={2} size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label={t('donViManagementPage.ma_don_vi')}>{detailDonVi.maDonVi}</Descriptions.Item>
              <Descriptions.Item label={t('donViManagementPage.ma_so_thue')}>{detailDonVi.maSoThue || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={t('donViManagementPage.ten_phap_ly')} span={2}>{detailDonVi.tenPhapLy}</Descriptions.Item>
              <Descriptions.Item label={t('phongBanManagementPage.ten_viet_tat')} span={2}>{detailDonVi.tenThuongMai || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={t('donViManagementPage.ten_mien')}>{detailDonVi.tenMienHeThong}</Descriptions.Item>
              <Descriptions.Item label="Website">{detailDonVi.duongDanWebsite || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Email">{detailDonVi.emailChinhThuc || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={t('donViManagementPage.sdt_di_dong')}>{detailDonVi.soDienThoaiDiDong || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={t('donViManagementPage.sdt_co_dinh')}>{detailDonVi.soDienThoaiCoDinh || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={t('donViManagementPage.nguoi_dai_dien')}>{[detailDonVi.hoNguoiDaiDien, detailDonVi.tenDemNguoiDaiDien, detailDonVi.tenNguoiDaiDien].filter(Boolean).join(' ') || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={t('donViManagementPage.chuc_vu_dai_dien')}>{detailDonVi.chucVuNguoiDaiDien || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={t('donViManagementPage.han_hop_dong')}>{t('donViManagementPage.detaildonvithoigianhethanhopdong_new_datedetaildonvithoigianhethanhopdongtolocaledatestringvivn_khong')}</Descriptions.Item>
              <Descriptions.Item label={t('donViManagementPage.tinhthanh_pho')}>{detailDonVi.tinhThanhPho || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={t('donViManagementPage.quanhuyen')}>{detailDonVi.quanHuyen || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={t('donViManagementPage.phuongxa')}>{detailDonVi.phuongXa || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={t('donViManagementPage.dia_chi_cu_the')} span={2}>{detailDonVi.soNhaTenDuong || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={t('donViManagementPage.ngay_thanh_lap')}>{detailDonVi.thoiGianThanhLap ? new Date(detailDonVi.thoiGianThanhLap).toLocaleDateString('vi-VN') : 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={t('donViManagementPage.ngay_bat_dau_hd')}>{detailDonVi.thoiGianBatDauHopDong ? new Date(detailDonVi.thoiGianBatDauHopDong).toLocaleDateString('vi-VN') : 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={t('loaiTaiSanFormModal.trang_thai')}>{renderStatus(detailDonVi.trangThai || '')}</Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </QuyenHanGuard>
  );
});

export default DonViManagementPage;
