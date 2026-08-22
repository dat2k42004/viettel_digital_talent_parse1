import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, Tooltip, message, Modal, Descriptions, Popconfirm, Dropdown, Row, Col, Select } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, MoreOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { layDanhSach1, themMoi1, capNhat1, capNhatQuyen, layTheoId1, xoaMem1 } from '../../../api-generated/endpoints/vai-tro-controller/vai-tro-controller';
import { layDanhSachQuyenPhanNhom, layDanhSachQuyen } from '../../../api-generated/endpoints/quyen-controller/quyen-controller';
import { layDanhSach29 as layDanhSachDonVi } from '../../../api-generated/endpoints/don-vi-controller/don-vi-controller';
import type { DonViResponse } from '../../../api-generated/models/donViResponse';
import type { VaiTroResponse } from '../../../api-generated/models/vaiTroResponse';
import type { QuyenResponse } from '../../../api-generated/models/quyenResponse';
import type { VaiTroRequest } from '../../../api-generated/models/vaiTroRequest';
import type { VaiTroQuyenUpdateRequest } from '../../../api-generated/models/vaiTroQuyenUpdateRequest';
import { RoleFormModal } from './RoleFormModal';
import { RoleMatrixModal } from './RoleMatrixModal';
import { authStore } from '../../../stores/AuthStore';

const { Title, Text } = Typography;

export const RoleManagementPage: React.FC = observer(() => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [danhSachVaiTro, setDanhSachVaiTro] = useState<VaiTroResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State Bộ lọc nâng cao
  const [searchText, setSearchText] = useState('');
  const [filterMaVaiTro, setFilterMaVaiTro] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState<string | undefined>(undefined);

  // Ma trận quyền hạn nạp từ API
  const [maTranQuyen, setMaTranQuyen] = useState<Record<string, QuyenResponse[]>>({});

  // Trạng thái các Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<VaiTroResponse | null>(null);
  const [detailRole, setDetailRole] = useState<VaiTroResponse | null>(null);

  const handleOpenDetail = async (id: number) => {
    try {
      const res = await layTheoId1(id);
      if (res.data) {
        setDetailRole(res.data);
        setIsDetailModalOpen(true);
      }
    } catch (e: any) {
      message.error(e?.message || t('roleManagementPage.khong_the_tai_thong'));
    }
  };

  const handleXoaVaiTro = async (id: number) => {
    try {
      await xoaMem1(id);
      message.success(t('roleManagementPage.xoa_vai_tro_thanh'));
      taiDuLieu(currentPage, pageSize, searchText, filterMaVaiTro, filterTrangThai);
    } catch (e: any) {
      message.error(e?.message || t('roleManagementPage.khong_the_xoa_vai'));
    }
  };

  // Danh sách quyền phẳng
  const [danhSachQuyen, setDanhSachQuyen] = useState<QuyenResponse[]>([]);

  const [danhSachDonVi, setDanhSachDonVi] = useState<DonViResponse[]>([]);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    taiDuLieu(currentPage, pageSize, searchText, filterMaVaiTro, filterTrangThai);
    taiMaTranQuyen();
    taiTatCaQuyen();
    if (authStore.laSuperAdmin) {
      taiDanhSachDonVi();
    }
  }, [currentPage, pageSize]);

  const taiDanhSachDonVi = async () => {
    try {
      const res = await layDanhSachDonVi({ page: 0, size: 1000 });
      if (res.data?.content) {
        setDanhSachDonVi(res.data.content);
      }
    } catch (e) {
      console.error(t('roleManagementPage.khong_the_tai_danh_sach_don_vi'), e);
    }
  };

  const taiTatCaQuyen = async () => {
    try {
      const res = await layDanhSachQuyen();
      if (res.data) {
        setDanhSachQuyen(res.data);
      }
    } catch (e) {
      console.error(t('roleManagementPage.khong_the_tai_danh_sach_quyen'), e);
    }
  };

  const taiDuLieu = async (page: number, size: number, search: string, maVaiTro?: string, trangThai?: string) => {
    setLoading(true);
    try {
      const res = await layDanhSach1({
        page: page - 1,
        size,
        tenVaiTro: search || undefined,
        maVaiTro: maVaiTro || undefined,
        trangThai: trangThai || undefined,
      });
      if (res.data) {
        setDanhSachVaiTro(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || t('roleManagementPage.khong_the_tai_danh'));
    } finally {
      setLoading(false);
    }
  };

  const taiMaTranQuyen = async () => {
    try {
      const res = await layDanhSachQuyenPhanNhom();
      if (res.data) {
        setMaTranQuyen(res.data);
      }
    } catch (e) {
      console.error(t('roleManagementPage.khong_the_tai_ma'), e);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    taiDuLieu(1, pageSize, searchText, filterMaVaiTro, filterTrangThai);
  };

  const handleResetFilters = () => {
    setSearchText('');
    setFilterMaVaiTro('');
    setFilterTrangThai(undefined);
    setCurrentPage(1);
    taiDuLieu(1, pageSize, '', '', undefined);
  };

  // Mở modal Thêm/Sửa vai trò
  const handleOpenEdit = (role: VaiTroResponse | null) => {
    setSelectedRole(role);
    setIsEditModalOpen(true);
  };

  // Lưu thông tin vai trò liên kết API thật
  const handleSaveVaiTro = async (values: VaiTroRequest) => {
    try {
      if (selectedRole?.id) {
        await capNhat1(selectedRole.id, values);
        message.success(t('roleManagementPage.cap_nhat_thong_tin'));
      } else {
        await themMoi1(values);
        message.success(t('roleManagementPage.them_moi_vai_tro'));
      }
      setIsEditModalOpen(false);
      taiDuLieu(currentPage, pageSize, searchText, filterMaVaiTro, filterTrangThai);
    } catch (e: any) {
      message.error(e?.message || t('roleManagementPage.luu_thong_tin_vai'));
    }
  };

  // Mở modal Phân quyền (Permission Matrix)
  const handleOpenMatrix = (role: VaiTroResponse) => {
    setSelectedRole(role);
    setIsMatrixModalOpen(true);
  };

  // Lưu cấu hình phân quyền ma trận liên kết API thật
  const handleSaveMatrixQuyen = async (values: VaiTroQuyenUpdateRequest) => {
    if (!selectedRole?.id) return;
    try {
      await capNhatQuyen(selectedRole.id, values);
      message.success(t('roleManagementPage.cap_nhat_ma_tran'));
      setIsMatrixModalOpen(false);
      taiDuLieu(currentPage, pageSize, searchText, filterMaVaiTro, filterTrangThai);
    } catch (e: any) {
      message.error(e?.message || t('roleManagementPage.luu_ma_tran_phan'));
    }
  };

  const columns = [
    ...(authStore.laSuperAdmin
      ? [
        {
          title: t('userManagementPage.don_vi_saas'),
          dataIndex: 'idDonVi',
          key: 'idDonVi',
          render: (val: any) => <Tag color="orange">{t('userManagementPage.don_vi_val', { val })}</Tag>,
        },
      ]
      : []),
    {
      title: t('roleManagementPage.ma_dinh_danh_vai'),
      dataIndex: 'maVaiTro',
      key: 'maVaiTro',
      sorter: (a: any, b: any) => (a.maVaiTro || '').localeCompare(b.maVaiTro || ''),
      defaultSortOrder: 'ascend' as const,
      render: (val: string) => <Tag color="purple">{val}</Tag>
    },
    {
      title: t('roleManagementPage.ten_vai_tro_hien'),
      dataIndex: 'tenVaiTro',
      key: 'tenVaiTro',
      render: (val: string) => <strong>{val}</strong>
    },
    {
      title: t('roleManagementPage.phan_loai'),
      dataIndex: 'laHeThong',
      key: 'laHeThong',
      render: (val: boolean) => (
        <Tag color={val ? 'blue' : 'default'}>{val ? t('roleManagementPage.he_thong') : t('roleManagementPage.tuy_bien')}</Tag>
      ),
    },
    ...(authStore.laSuperAdmin ? [{
      title: t('roleManagementPage.don_vi_ap_dung'),
      dataIndex: 'idDonVi',
      key: 'idDonVi',
      render: (val?: number) => {
        if (!val) return <Tag color="blue">{t('danhMucCauHinhPage.he_thong')}</Tag>;
        const dv = danhSachDonVi.find(d => d.id === val);
        return <span>{dv?.tenPhapLy || t('roleManagementPage.don_vi_id', { id: val })}</span>;
      }
    }] : []),
    {
      title: t('roleManagementPage.muc_uu_tien'),
      dataIndex: 'capDoUuTien',
      key: 'capDoUuTien',
      sorter: (a: VaiTroResponse, b: VaiTroResponse) => (a.capDoUuTien || 0) - (b.capDoUuTien || 0),
      render: (val: number) => <Tag color="cyan">{t('roleManagementPage.cap_bac', { cap: val || 0 })}</Tag>
    },
    { title: t('viTriFormModal.mo_ta_chi_tiet'), dataIndex: 'moTa', key: 'moTa', render: (val: string) => val || t('roleManagementPage.chua_thiet_lap_mo') },
    {
      title: t('roleManagementPage.tong_so_quyen_gan'),
      dataIndex: 'danhSachQuyen',
      key: 'danhSachQuyen',
      render: (list?: any[]) => <Tag color="cyan">{t('roleManagementPage.so_quyen_gan', { count: list?.length || 0 })}</Tag>,
    },
    {
      title: t('loaiTaiSanFormModal.trang_thai'),
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (val: string) => (
        <Tag color={val === 'HOAT_DONG' ? 'green' : 'red'}>
          {val === 'HOAT_DONG' ? t('userManagementPage.hoat_dong') : t('userManagementPage.bi_khoa')}
        </Tag>
      ),
    },
    {
      title: t('viTriManagementPage.hanh_dong'),
      key: 'hanhDong',
      render: (_: any, record: VaiTroResponse) => {
        const actItems: MenuProps['items'] = [
          {
            key: 'detail',
            icon: <EyeOutlined />,
            label: t('donViManagementPage.xem_chi_tiet'),
            onClick: () => record.id && handleOpenDetail(record.id),
          },
          authStore.kiemTraQuyen('SUA_VAI_TRO') && {
            key: 'edit',
            icon: <EditOutlined />,
            label: t('roleManagementPage.chinh_sua_vai_tro'),
            onClick: () => handleOpenEdit(record),
          },
          authStore.kiemTraQuyen('CAP_NHAT_QUYEN_VAI_TRO') && {
            key: 'matrix',
            icon: <SafetyOutlined />,
            label: t('roleManagementPage.thiet_lap_ma_tran'),
            onClick: () => handleOpenMatrix(record),
          },
          authStore.kiemTraQuyen('XOA_VAI_TRO') && {
            key: 'delete',
            label: (
              <Popconfirm
                title={t('roleManagementPage.xac_nhan_xoa_vai')}
                description={t('roleManagementPage.ban_co_chac_chan')}
                onConfirm={() => record.id && handleXoaVaiTro(record.id)}
                okText={t('userManagementPage.xac_nhan')}
                cancelText={t('viTriManagementPage.huy')}
                okButtonProps={{ danger: true }}
              >
                <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>
                  <DeleteOutlined style={{ marginRight: 8 }} /> Xóa vai trò
                </span>
              </Popconfirm>
            ),
          },
        ].filter(Boolean) as MenuProps['items'];

        if (!actItems || actItems.length === 0) {
          return <Text type="secondary" style={{ fontSize: 12 }}>{t('userManagementPage.khong_co_quyen')}</Text>;
        }

        return (
          <Dropdown menu={{ items: actItems }} trigger={['click']} placement="bottomRight">
            <Button size="small" type="primary" ghost>
              {t('common.actionBtn')} <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} style={{ margin: 0, fontSize: 24 }}>{t('roleManagementPage.quan_ly_vai_tro')}</Title>
          <Text type="secondary">{t('roleManagementPage.cau_hinh_nhom_vai')}</Text>
        </div>
        <QuyenHanGuard quyenYeuCau="THEM_VAI_TRO">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenEdit(null)}>
            Thêm mới vai trò
          </Button>
        </QuyenHanGuard>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8} md={8}>
            <Input
              placeholder={t('roleManagementPage.tim_kiem_ten_vai')}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder={t('roleManagementPage.ma_vai_tro')}
              value={filterMaVaiTro}
              onChange={(e) => setFilterMaVaiTro(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={5}>
            <Select
              placeholder={t('loaiTaiSanFormModal.trang_thai')}
              style={{ width: '100%' }}
              value={filterTrangThai}
              onChange={setFilterTrangThai}
              allowClear
            >
              <Select.Option value="HOAT_DONG">{t('userManagementPage.hoat_dong')}</Select.Option>
              <Select.Option value="BI_KHOA">{t('userManagementPage.bi_khoa')}</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={5}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>{t('phieuNhapTaiSanPage.tim_kiem')}</Button>
              <Button onClick={handleResetFilters}>{t('viTriManagementPage.lam_moi')}</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          loading={loading}
          dataSource={danhSachVaiTro}
          columns={columns}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            onChange: (p, s) => {
              setCurrentPage(p);
              setPageSize(s);
            },
          }}
        />
      </Card>

      <RoleFormModal
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        selectedRole={selectedRole}
        danhSachQuyen={danhSachQuyen}
        danhSachDonVi={danhSachDonVi}
        onSave={handleSaveVaiTro}
      />

      <RoleMatrixModal
        open={isMatrixModalOpen}
        onCancel={() => setIsMatrixModalOpen(false)}
        selectedRole={selectedRole}
        maTranQuyen={maTranQuyen}
        onSave={handleSaveMatrixQuyen}
      />

      <Modal
        title={t('roleManagementPage.chi_tiet_vai_tro')}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>{t('common.close')}</Button>
        ]}
        width={650}
      >
        {detailRole && (
          <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label={t('roleManagementPage.ma_dinh_danh_vai')}>
              <Tag color="purple">{detailRole.maVaiTro}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('roleManagementPage.ten_vai_tro_hien')}>
              <strong>{detailRole.tenVaiTro}</strong>
            </Descriptions.Item>
            <Descriptions.Item label={t('roleManagementPage.mo_ta')}>
              {detailRole.moTa || t('roleManagementPage.khong_co_mo_ta')}
            </Descriptions.Item>
            <Descriptions.Item label={t('roleManagementPage.phan_loai')}>
              <Tag color={detailRole.laHeThong ? 'blue' : 'default'}>
                {detailRole.laHeThong ? t('roleManagementPage.he_thong') : t('roleManagementPage.tuy_bien')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('roleManagementPage.do_uu_tien')}>
              {t('roleManagementPage.cap_bac', { cap: detailRole.capDoUuTien || 0 })}
            </Descriptions.Item>
            <Descriptions.Item label={t('loaiTaiSanFormModal.trang_thai')}>
              <Tag color={detailRole.trangThai === 'HOAT_DONG' ? 'green' : 'red'}>
                {detailRole.trangThai === 'HOAT_DONG' ? t('userManagementPage.hoat_dong') : t('userManagementPage.bi_khoa')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('roleManagementPage.don_vi_gan')}>
              <Tag color="orange">
                {!detailRole.idDonVi ? t('roleManagementPage.he_thong_toan_san') : (danhSachDonVi.find(d => d.id === detailRole.idDonVi)?.tenPhapLy || t('roleManagementPage.don_vi_id', { id: detailRole.idDonVi }))}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('roleManagementPage.quyen_han_cua_vai')}>
              <Space wrap>
                {detailRole.danhSachQuyen?.map(q => (
                  <Tag color="cyan" key={q.id}>{q.tenQuyen} ({q.maQuyen})</Tag>
                )) || <Text type="secondary">{t('roleManagementPage.chua_cau_hinh_quyen')}</Text>}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
});

export default RoleManagementPage;
