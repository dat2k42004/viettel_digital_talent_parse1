import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Switch, Tooltip, message, Popconfirm, Typography, Modal, Descriptions, Select, Row, Col, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, SafetyOutlined, LockOutlined, UnlockOutlined, KeyOutlined, EyeOutlined, DeleteOutlined, DownOutlined, MoreOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { layDanhSach15, themMoi15, capNhat15, capNhatTrangThai9, capNhatQuyen1, thuHoiPhien, layTheoId15, xoaMem15 } from '../../../api-generated/endpoints/nguoi-dung-controller/nguoi-dung-controller';
import { layDropdown } from '../../../api-generated/endpoints/vai-tro-controller/vai-tro-controller';
import { layDanhSachQuyen } from '../../../api-generated/endpoints/quyen-controller/quyen-controller';
import { layDanhSach6 } from '../../../api-generated/endpoints/phong-ban-controller/phong-ban-controller';
import type { NguoiDungResponse } from '../../../api-generated/models/nguoiDungResponse';
import type { VaiTroDropdownResponse } from '../../../api-generated/models/vaiTroDropdownResponse';
import type { QuyenResponse } from '../../../api-generated/models/quyenResponse';
import type { NguoiDungRequest } from '../../../api-generated/models/nguoiDungRequest';
import type { NguoiDungQuyenUpdateRequest } from '../../../api-generated/models/nguoiDungQuyenUpdateRequest';
import { UserFormModal } from './UserFormModal';
import { UserQuyenModal } from './UserQuyenModal';
import { authStore } from '../../../stores/AuthStore';

const { Title, Text } = Typography;

export const UserManagementPage: React.FC = observer(() => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [danhSachNguoiDung, setDanhSachNguoiDung] = useState<NguoiDungResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State Bộ lọc nâng cao
  const [searchText, setSearchText] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState<string | undefined>(undefined);
  const [filterPhongBan, setFilterPhongBan] = useState<number | undefined>(undefined);
  const [filterChucVu, setFilterChucVu] = useState<string>('');
  const [filterMaNguoiDung, setFilterMaNguoiDung] = useState<string>('');

  // Danh sách vai trò, quyền, phòng ban động tải từ API
  const [danhSachVaiTro, setDanhSachVaiTro] = useState<VaiTroDropdownResponse[]>([]);
  const [danhSachQuyen, setDanhSachQuyen] = useState<QuyenResponse[]>([]);
  const [danhSachPhongBan, setDanhSachPhongBan] = useState<any[]>([]);

  // Trạng thái các Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQuyenModalOpen, setIsQuyenModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<NguoiDungResponse | null>(null);
  const [detailUser, setDetailUser] = useState<NguoiDungResponse | null>(null);

  const handleOpenDetail = async (id: number) => {
    try {
      const res = await layTheoId15(id);
      if (res.data) {
        setDetailUser(res.data);
        setIsDetailModalOpen(true);
      }
    } catch (e: any) {
      message.error(e?.message || t('userManagementPage.khong_the_tai_thong'));
    }
  };

  const handleXoaNguoiDung = async (id: number) => {
    try {
      await xoaMem15(id);
      message.success(t('userManagementPage.xoa_tai_khoan_nguoi'));
      taiDuLieu(currentPage, pageSize, searchText, filterTrangThai, filterPhongBan, filterChucVu, filterMaNguoiDung);
    } catch (e: any) {
      message.error(e?.message || t('userManagementPage.khong_the_xoa_tai'));
    }
  };

  // Tải dữ liệu ban đầu
  useEffect(() => {
    taiDuLieu(currentPage, pageSize, searchText, filterTrangThai, filterPhongBan, filterChucVu, filterMaNguoiDung);
    taiVaiTroDropdown();
    taiTatCaQuyen();
    taiDanhSachPhongBan();
  }, [currentPage, pageSize]);

  const taiDanhSachPhongBan = async () => {
    try {
      const res = await layDanhSach6({ size: 100 });
      if (res.data?.content) {
        setDanhSachPhongBan(res.data.content);
      }
    } catch (e) {
      console.error(t('userManagementPage.khong_the_lay_danh_sach_phong_ban'), e);
    }
  };

  const taiDuLieu = async (
    page: number,
    size: number,
    search: string,
    trangThai?: string,
    idPhongBan?: number,
    chucVu?: string,
    maNguoiDung?: string
  ) => {
    setLoading(true);
    try {
      const res = await layDanhSach15({
        page: page - 1,
        size,
        search: search || undefined,
        trangThai: trangThai || undefined,
        idPhongBan: idPhongBan || undefined,
        chucVu: chucVu || undefined,
        maNguoiDung: maNguoiDung || undefined,
      });
      if (res.data) {
        setDanhSachNguoiDung(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || t('userManagementPage.khong_the_tai_danh'));
    } finally {
      setLoading(false);
    }
  };

  const taiVaiTroDropdown = async () => {
    try {
      const res = await layDropdown();
      if (res.data) {
        setDanhSachVaiTro(res.data);
      }
    } catch (e) {
      console.error(t('userManagementPage.khong_the_lay_danh_muc_vai_tro'), e);
    }
  };

  const taiTatCaQuyen = async () => {
    try {
      const res = await layDanhSachQuyen();
      if (res.data) {
        setDanhSachQuyen(res.data);
      }
    } catch (e) {
      console.error(t('userManagementPage.khong_the_lay_danh'), e);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    taiDuLieu(1, pageSize, searchText, filterTrangThai, filterPhongBan, filterChucVu, filterMaNguoiDung);
  };

  const handleResetFilters = () => {
    setSearchText('');
    setFilterTrangThai(undefined);
    setFilterPhongBan(undefined);
    setFilterChucVu('');
    setFilterMaNguoiDung('');
    setCurrentPage(1);
    taiDuLieu(1, pageSize, '', undefined, undefined, '', '');
  };

  // Mở Form Thêm/Sửa
  const handleOpenEdit = (user: NguoiDungResponse | null) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Lưu Form Thêm/Sửa liên kết API thật
  const handleSaveNguoiDung = async (values: NguoiDungRequest) => {
    try {
      if (selectedUser?.id) {
        await capNhat15(selectedUser.id, values);
        message.success(t('userManagementPage.cap_nhat_thong_tin'));
      } else {
        await themMoi15(values);
        message.success(t('userManagementPage.tao_moi_tai_khoan'));
      }
      setIsEditModalOpen(false);
      taiDuLieu(currentPage, pageSize, searchText, filterTrangThai, filterPhongBan, filterChucVu, filterMaNguoiDung);
    } catch (e: any) {
      message.error(e?.message || t('userManagementPage.luu_thong_tin_that'));
    }
  };

  // Khóa / Kích hoạt tài khoản người dùng
  const handleToggleTrangThai = async (user: NguoiDungResponse, active: boolean) => {
    if (!user.id) return;
    const trangThaiMoi = active ? 'HOAT_DONG' : 'KHOA';
    try {
      await capNhatTrangThai9(user.id, { trangThai: trangThaiMoi });
      message.success(t('userManagementPage.doi_trang_thai_tai_khoan_1', { khoa: active ? t('userManagementPage.hoat_dong') : t('userManagementPage.khoa') }));
      taiDuLieu(currentPage, pageSize, searchText, filterTrangThai, filterPhongBan, filterChucVu, filterMaNguoiDung);
    } catch (e: any) {
      message.error(e?.message || t('viTriManagementPage.cap_nhat_trang_thai'));
    }
  };

  // Cưỡng chế thoát phiên làm việc (Redis Blacklist)
  const handleCuongCheLogout = async (id: number) => {
    try {
      await thuHoiPhien(id);
      message.success(t('userManagementPage.da_gui_yeu_cau'));
    } catch (e: any) {
      message.error(e?.message || t('userManagementPage.thu_hoi_phien_that'));
    }
  };

  // Mở Form cấp quyền trực tiếp
  const handleOpenQuyenTrucTiep = (user: NguoiDungResponse) => {
    setSelectedUser(user);
    setIsQuyenModalOpen(true);
  };

  // Lưu cấp quyền trực tiếp
  const handleSaveQuyenTrucTiep = async (values: NguoiDungQuyenUpdateRequest) => {
    if (!selectedUser?.id) return;
    try {
      await capNhatQuyen1(selectedUser.id, values);
      message.success(t('userManagementPage.cap_nhat_quyen_truc_tiep'));
      setIsQuyenModalOpen(false);
      taiDuLieu(currentPage, pageSize, searchText, filterTrangThai, filterPhongBan, filterChucVu, filterMaNguoiDung);
    } catch (e: any) {
      message.error(e?.message || t('userManagementPage.cap_nhat_quyen_truc'));
    }
  };

  // Hàm kiểm tra xem tài khoản có vai trò Admin Đơn vị hay không
  const laAdminDonViRecord = (record: NguoiDungResponse) => {
    return record.danhSachVaiTro?.some(
      r => r.maVaiTro?.toUpperCase().includes('ADMIN') && !r.maVaiTro?.toUpperCase().includes('SUPER')
    ) || false;
  };

  const columns = [
    ...(authStore.laSuperAdmin
      ? [
        {
          title: t('userManagementPage.don_vi_saas'),
          dataIndex: 'idDonVi',
          key: 'idDonVi',
          sorter: (a: NguoiDungResponse, b: NguoiDungResponse) => (a.idDonVi || 0) - (b.idDonVi || 0),
          defaultSortOrder: 'ascend' as const,
          render: (val: any) => <Tag color="orange">{t('userManagementPage.don_vi_val', { val })}</Tag>,
        },
      ]
      : []),
    {
      title: t('userManagementPage.tai_khoan_thanh_vien'),
      dataIndex: 'tenDangNhap',
      key: 'tenDangNhap',
      render: (val: string, record: NguoiDungResponse) => {
        const fullname = [record.hoNguoiDung, record.tenDemNguoiDung, record.tenNguoiDung].filter(Boolean).join(' ');
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>{fullname || t('userManagementPage.chua_cap_nhat_ten')}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{t('userManagementPage.ten_dang_nhap')}: {val}</div>
            {record.maNguoiDung && (
              <div style={{ fontSize: 12, color: '#1890ff', fontWeight: 500 }}>
                {t('userManagementPage.ma_nhan_vien')}: {record.maNguoiDung}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: t('nhaCungCapPage.thong_tin_lien_he'),
      dataIndex: 'email',
      key: 'email',
      render: (val: string, record: NguoiDungResponse) => (
        <div>
          <div>Email: {val || t('userManagementPage.chua_thiet_lap')}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{t('userManagementPage.sdt')}: {record.soDienThoai || t('userManagementPage.chua_thiet_lap')}</div>
        </div>
      )
    },
    { title: t('appLayout.title'), dataIndex: 'chucVu', key: 'chucVu', render: (val: string) => val || t('userManagementPage.nhan_vien') },
    { title: t('phieuKiemKePage.phong_ban'), dataIndex: 'tenPhongBan', key: 'tenPhongBan', render: (val: string) => val || t('userManagementPage.mac_dinh') },
    {
      title: t('userManagementPage.vai_tro_phan_bo'),
      dataIndex: 'danhSachVaiTro',
      key: 'danhSachVaiTro',
      render: (roles?: VaiTroDropdownResponse[]) => (
        <Space wrap>
          {roles?.map(r => (
            <Tag color="blue" key={r.id}>{r.tenVaiTro}</Tag>
          ))}
          {(!roles || roles.length === 0) && <Text type="secondary">{t('userManagementPage.chua_gan_vai_tro')}</Text>}
        </Space>
      ),
    },
    {
      title: t('userManagementPage.trang_thai_hoat_dong'),
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (val: string, record: NguoiDungResponse) => {
        const coQuyenTacDong = true;
        return (
          <QuyenHanGuard quyenYeuCau="CAP_NHAT_TRANG_THAI_NGUOI_DUNG" fallback={<Tag color={val === 'HOAT_DONG' ? 'green' : 'red'}>{t('userManagementPage.val_hoat_dong_dang_hoat')}</Tag>}>
            <Switch
              disabled={!coQuyenTacDong}
              checkedChildren={<UnlockOutlined />}
              unCheckedChildren={<LockOutlined />}
              checked={val === 'HOAT_DONG'}
              onChange={(checked) => handleToggleTrangThai(record, checked)}
            />
          </QuyenHanGuard>
        );
      },
    },
    {
      title: t('viTriManagementPage.hanh_dong'),
      key: 'hanhDong',
      render: (_: any, record: NguoiDungResponse) => {
        const coQuyenTacDong = true;

        const actItems: MenuProps['items'] = [
          {
            key: 'detail',
            icon: <EyeOutlined />,
            label: t('donViManagementPage.xem_chi_tiet'),
            onClick: () => record.id && handleOpenDetail(record.id),
          },
          coQuyenTacDong && authStore.kiemTraQuyen('SUA_NGUOI_DUNG') && {
            key: 'edit',
            icon: <EditOutlined />,
            label: t('userManagementPage.chinh_sua_tai_khoan'),
            onClick: () => handleOpenEdit(record),
          },
          coQuyenTacDong && authStore.kiemTraQuyen('CAP_NHAT_QUYEN_NGUOI_DUNG') && {
            key: 'quyen',
            icon: <KeyOutlined />,
            label: t('userManagementPage.gan_quyen_truc_tiep'),
            onClick: () => handleOpenQuyenTrucTiep(record),
          },
          coQuyenTacDong && authStore.kiemTraQuyen('CAP_NHAT_TRANG_THAI_NGUOI_DUNG') && {
            key: 'logout',
            label: (
              <Popconfirm
                title={t('userManagementPage.xac_nhan_cuong_che')}
                description={t('userManagementPage.thu_hoi_toan_bo')}
                onConfirm={() => record.id && handleCuongCheLogout(record.id)}
                okText={t('userManagementPage.dong_y')}
                cancelText={t('viTriManagementPage.huy')}
              >
                <span style={{ color: '#fa8c16', display: 'block', width: '100%' }}>
                  <SafetyOutlined style={{ marginRight: 8 }} /> Cưỡng chế đăng xuất
                </span>
              </Popconfirm>
            ),
          },
          coQuyenTacDong && authStore.kiemTraQuyen('XOA_NGUOI_DUNG') && {
            key: 'delete',
            label: (
              <Popconfirm
                title={t('userManagementPage.xac_nhan_xoa_tai')}
                description={t('userManagementPage.ban_co_chac_chan')}
                onConfirm={() => record.id && handleXoaNguoiDung(record.id)}
                okText={t('userManagementPage.xac_nhan')}
                cancelText={t('viTriManagementPage.huy')}
                okButtonProps={{ danger: true }}
              >
                <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>
                  <DeleteOutlined style={{ marginRight: 8 }} /> Xóa tài khoản
                </span>
              </Popconfirm>
            ),
          },
        ].filter(Boolean) as MenuProps['items'];

        if (!coQuyenTacDong) {
          return (
            <Space>
              <Button size="small" icon={<EyeOutlined />} onClick={() => record.id && handleOpenDetail(record.id)}>
                Chi tiết
              </Button>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('userManagementPage.khoa_cung_ui')}</Text>
            </Space>
          );
        }

        if (!actItems || actItems.length === 0) {
          return <Text type="secondary" style={{ fontSize: 12 }}>{t('userManagementPage.khong_co_quyen')}</Text>;
        }

        return (
          <Dropdown menu={{ items: actItems }} trigger={['click']} placement="bottomRight">
            <Button size="small" type="primary" ghost>
              Thao tác <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  // Lọc vai trò gán được trong Modal Form
  const vaiTroDuocGan = danhSachVaiTro;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: 24 }}>{t('userManagementPage.quan_ly_tai_khoan')}</Title>
          <Text type="secondary">{t('userManagementPage.cap_phat_tai_khoan')}</Text>
        </div>
        <QuyenHanGuard quyenYeuCau="THEM_NGUOI_DUNG">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenEdit(null)}>
            Thêm mới tài khoản
          </Button>
        </QuyenHanGuard>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder={t('userManagementPage.tim_kiem_ho_ten')}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder={t('loaiTaiSanFormModal.trang_thai')}
              style={{ width: '100%' }}
              value={filterTrangThai}
              onChange={setFilterTrangThai}
              allowClear
            >
              <Select.Option value="HOAT_DONG">{t('loaiTaiSanFormModal.dang_hoat_dong')}</Select.Option>
              <Select.Option value="BI_KHOA">{t('userManagementPage.bi_khoa')}</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder={t('phieuKiemKePage.phong_ban')}
              style={{ width: '100%' }}
              value={filterPhongBan}
              onChange={setFilterPhongBan}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {danhSachPhongBan.map((pb) => (
                <Select.Option key={pb.id} value={pb.id}>
                  {pb.tenPhongBan}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Input
              placeholder={t('userManagementPage.chuc_danh')}
              value={filterChucVu}
              onChange={(e) => setFilterChucVu(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Input
                placeholder={t('userManagementPage.ma_nhan_vien_1')}
                value={filterMaNguoiDung}
                onChange={(e) => setFilterMaNguoiDung(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
                style={{ width: 140 }}
              />
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>{t('phieuNhapTaiSanPage.tim_kiem')}</Button>
              <Button onClick={handleResetFilters}>{t('viTriManagementPage.lam_moi')}</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          loading={loading}
          dataSource={danhSachNguoiDung}
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

      <UserFormModal
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        selectedUser={selectedUser}
        onSave={handleSaveNguoiDung}
      />

      <UserQuyenModal
        open={isQuyenModalOpen}
        onCancel={() => setIsQuyenModalOpen(false)}
        selectedUser={selectedUser}
        danhSachQuyen={danhSachQuyen}
        onSave={handleSaveQuyenTrucTiep}
      />

      <Modal
        title={t('userManagementPage.chi_tiet_tai_khoan')}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {detailUser && (
          <Descriptions bordered column={2} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label={t('donViCreateModal.ten_dang_nhap')} span={2}>
              <strong>{detailUser.tenDangNhap}</strong>
            </Descriptions.Item>
            <Descriptions.Item label={t('userManagementPage.ma_nhan_vien')}>
              <strong>{detailUser.maNguoiDung || t('userManagementPage.chua_cap_nhat')}</strong>
            </Descriptions.Item>
            <Descriptions.Item label={t('userManagementPage.ho_ten')}>
              {[detailUser.hoNguoiDung, detailUser.tenDemNguoiDung, detailUser.tenNguoiDung].filter(Boolean).join(' ') || t('userManagementPage.chua_cap_nhat')}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {detailUser.email || t('userManagementPage.chua_cap_nhat')}
            </Descriptions.Item>
            <Descriptions.Item label={t('appLayout.phone')}>
              {detailUser.soDienThoai || t('userManagementPage.chua_cap_nhat')}
            </Descriptions.Item>
            <Descriptions.Item label={t('donViFormModal.chuc_vu')}>
              {detailUser.chucVu || t('userManagementPage.chua_cap_nhat')}
            </Descriptions.Item>
            <Descriptions.Item label={t('phieuKiemKePage.phong_ban')}>
              {detailUser.tenPhongBan || t('userManagementPage.chua_cap_nhat')}
            </Descriptions.Item>
            <Descriptions.Item label={t('donViManagementPage.ma_don_vi')}>
              <Tag color="orange">{t('userManagementPage.don_vi_val', { val: detailUser.idDonVi })}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('loaiTaiSanFormModal.trang_thai')}>
              <Tag color={detailUser.trangThai === 'HOAT_DONG' ? 'green' : 'red'}>
                {detailUser.trangThai === 'HOAT_DONG' ? t('userManagementPage.hoat_dong') : t('userManagementPage.bi_khoa')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('userManagementPage.vai_tro_gan')} span={2}>
              <Space wrap>
                {detailUser.danhSachVaiTro?.map(r => (
                  <Tag color="blue" key={r.id}>{r.tenVaiTro} ({r.maVaiTro})</Tag>
                )) || <Text type="secondary">{t('userManagementPage.chua_gan_vai_tro')}</Text>}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('userManagementPage.quyen_han_truc_tiep')} span={2}>
              <Space wrap>
                {detailUser.danhSachQuyen?.map(q => (
                  <Tag color="purple" key={q.id}>{q.tenQuyen} ({q.maQuyen})</Tag>
                )) || <Text type="secondary">{t('userManagementPage.khong_co_quyen_truc')}</Text>}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('userManagementPage.danh_sach_quyen_phan')} span={2}>
              <Space wrap>
                {detailUser.danhSachQuyenPhanGiai?.map(q => (
                  <Tag color="cyan" key={q}>{q}</Tag>
                )) || <Text type="secondary">{t('userManagementPage.khong_co_quyen')}</Text>}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
});

export default UserManagementPage;
