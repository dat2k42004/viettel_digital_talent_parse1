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
      message.error(e?.message || 'Không thể tải thông tin chi tiết người dùng!');
    }
  };

  const handleXoaNguoiDung = async (id: number) => {
    try {
      await xoaMem15(id);
      message.success('Xóa tài khoản người dùng thành công!');
      taiDuLieu(currentPage, pageSize, searchText, filterTrangThai, filterPhongBan, filterChucVu, filterMaNguoiDung);
    } catch (e: any) {
      message.error(e?.message || 'Không thể xóa tài khoản người dùng!');
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
      console.error('Không thể lấy danh sách phòng ban', e);
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
      message.error(e?.message || 'Không thể tải danh sách người dùng từ hệ thống!');
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
      console.error('Không thể lấy danh mục vai trò', e);
    }
  };

  const taiTatCaQuyen = async () => {
    try {
      const res = await layDanhSachQuyen();
      if (res.data) {
        setDanhSachQuyen(res.data);
      }
    } catch (e) {
      console.error('Không thể lấy danh mục quyền hạn', e);
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
        message.success('Cập nhật thông tin tài khoản người dùng thành công!');
      } else {
        await themMoi15(values);
        message.success('Tạo mới tài khoản người dùng thành công!');
      }
      setIsEditModalOpen(false);
      taiDuLieu(currentPage, pageSize, searchText, filterTrangThai, filterPhongBan, filterChucVu, filterMaNguoiDung);
    } catch (e: any) {
      message.error(e?.message || 'Lưu thông tin thất bại, vui lòng kiểm tra lại!');
    }
  };

  // Khóa / Kích hoạt tài khoản người dùng
  const handleToggleTrangThai = async (user: NguoiDungResponse, active: boolean) => {
    if (!user.id) return;
    const trangThaiMoi = active ? 'HOAT_DONG' : 'KHOA';
    try {
      await capNhatTrangThai9(user.id, { trangThai: trangThaiMoi });
      message.success(`Đổi trạng thái tài khoản người dùng sang ${active ? 'Hoạt động' : 'khóa'} thành công!`);
      taiDuLieu(currentPage, pageSize, searchText, filterTrangThai, filterPhongBan, filterChucVu, filterMaNguoiDung);
    } catch (e: any) {
      message.error(e?.message || 'Cập nhật trạng thái thất bại!');
    }
  };

  // Cưỡng chế thoát phiên làm việc (Redis Blacklist)
  const handleCuongCheLogout = async (id: number) => {
    try {
      await thuHoiPhien(id);
      message.success('Đã gửi yêu cầu cưỡng chế thoát phiên làm việc tài khoản thành công!');
    } catch (e: any) {
      message.error(e?.message || 'Thu hồi phiên thất bại!');
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
      message.success('Cập nhật quyền trực tiếp (Override) thành công!');
      setIsQuyenModalOpen(false);
      taiDuLieu(currentPage, pageSize, searchText, filterTrangThai, filterPhongBan, filterChucVu, filterMaNguoiDung);
    } catch (e: any) {
      message.error(e?.message || 'Cập nhật quyền trực tiếp thất bại!');
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
          title: 'Đơn vị (SaaS)',
          dataIndex: 'idDonVi',
          key: 'idDonVi',
          sorter: (a: NguoiDungResponse, b: NguoiDungResponse) => (a.idDonVi || 0) - (b.idDonVi || 0),
          defaultSortOrder: 'ascend' as const,
          render: (val: any) => <Tag color="orange">Đơn vị {val}</Tag>,
        },
      ]
      : []),
    {
      title: 'Tài khoản thành viên',
      dataIndex: 'tenDangNhap',
      key: 'tenDangNhap',
      render: (val: string, record: NguoiDungResponse) => {
        const fullname = [record.hoNguoiDung, record.tenDemNguoiDung, record.tenNguoiDung].filter(Boolean).join(' ');
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>{fullname || 'Chưa cập nhật tên'}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>Tên đăng nhập: {val}</div>
            {record.maNguoiDung && (
              <div style={{ fontSize: 12, color: '#1890ff', fontWeight: 500 }}>
                Mã nhân viên: {record.maNguoiDung}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Thông tin liên hệ',
      dataIndex: 'email',
      key: 'email',
      render: (val: string, record: NguoiDungResponse) => (
        <div>
          <div>Email: {val || 'Chưa thiết lập'}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>SĐT: {record.soDienThoai || 'Chưa thiết lập'}</div>
        </div>
      )
    },
    { title: 'Chức danh', dataIndex: 'chucVu', key: 'chucVu', render: (val: string) => val || 'Nhân viên' },
    { title: 'Phòng ban', dataIndex: 'tenPhongBan', key: 'tenPhongBan', render: (val: string) => val || 'Mặc định' },
    {
      title: 'Vai trò phân bổ',
      dataIndex: 'danhSachVaiTro',
      key: 'danhSachVaiTro',
      render: (roles?: VaiTroDropdownResponse[]) => (
        <Space wrap>
          {roles?.map(r => (
            <Tag color="blue" key={r.id}>{r.tenVaiTro}</Tag>
          ))}
          {(!roles || roles.length === 0) && <Text type="secondary">Chưa gán vai trò</Text>}
        </Space>
      ),
    },
    {
      title: 'Trạng thái hoạt động',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (val: string, record: NguoiDungResponse) => {
        const coQuyenTacDong = true;
        return (
          <QuyenHanGuard quyenYeuCau="CAP_NHAT_TRANG_THAI_NGUOI_DUNG" fallback={<Tag color={val === 'HOAT_DONG' ? 'green' : 'red'}>{val === 'HOAT_DONG' ? 'Đang hoạt động' : 'Bị khóa'}</Tag>}>
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
      title: 'Hành động',
      key: 'hanhDong',
      render: (_: any, record: NguoiDungResponse) => {
        const coQuyenTacDong = true;

        const actItems: MenuProps['items'] = [
          {
            key: 'detail',
            icon: <EyeOutlined />,
            label: 'Xem chi tiết',
            onClick: () => record.id && handleOpenDetail(record.id),
          },
          coQuyenTacDong && authStore.kiemTraQuyen('SUA_NGUOI_DUNG') && {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Chỉnh sửa tài khoản',
            onClick: () => handleOpenEdit(record),
          },
          coQuyenTacDong && authStore.kiemTraQuyen('CAP_NHAT_QUYEN_NGUOI_DUNG') && {
            key: 'quyen',
            icon: <KeyOutlined />,
            label: 'Gán quyền trực tiếp',
            onClick: () => handleOpenQuyenTrucTiep(record),
          },
          coQuyenTacDong && authStore.kiemTraQuyen('CAP_NHAT_TRANG_THAI_NGUOI_DUNG') && {
            key: 'logout',
            label: (
              <Popconfirm
                title="Xác nhận cưỡng chế thoát?"
                description="Thu hồi toàn bộ phiên đăng nhập của người dùng này khỏi Redis?"
                onConfirm={() => record.id && handleCuongCheLogout(record.id)}
                okText="Đồng ý"
                cancelText="Hủy"
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
                title="Xác nhận xóa tài khoản?"
                description="Bạn có chắc chắn muốn xóa tài khoản người dùng này không?"
                onConfirm={() => record.id && handleXoaNguoiDung(record.id)}
                okText="Xác nhận"
                cancelText="Hủy"
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
              <Text type="secondary" style={{ fontSize: 12 }}>Khóa cứng UI</Text>
            </Space>
          );
        }

        if (actItems.length === 0) {
          return <Text type="secondary" style={{ fontSize: 12 }}>Không có quyền</Text>;
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
          <Title level={2} style={{ margin: 0, fontSize: 24 }}>Quản lý tài khoản người dùng</Title>
          <Text type="secondary">Cấp phát tài khoản nhân viên, khóa/mở quyền hệ thống, cưỡng chế thoát phiên và ghi đè cấp quyền trực tiếp.</Text>
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
              placeholder="Tìm kiếm họ tên, email, tài khoản..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              value={filterTrangThai}
              onChange={setFilterTrangThai}
              allowClear
            >
              <Select.Option value="HOAT_DONG">Đang hoạt động</Select.Option>
              <Select.Option value="BI_KHOA">Bị khóa</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Phòng ban"
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
              placeholder="Chức danh..."
              value={filterChucVu}
              onChange={(e) => setFilterChucVu(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Input
                placeholder="Mã nhân viên..."
                value={filterMaNguoiDung}
                onChange={(e) => setFilterMaNguoiDung(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
                style={{ width: 140 }}
              />
              <Button type="primary" onClick={handleSearch}>Lọc</Button>
              <Button onClick={handleResetFilters}>Làm mới</Button>
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
        danhSachVaiTro={vaiTroDuocGan}
        danhSachPhongBan={danhSachPhongBan}
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
        title="Chi tiết tài khoản người dùng"
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
            <Descriptions.Item label="Tên đăng nhập" span={2}>
              <strong>{detailUser.tenDangNhap}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Mã nhân viên">
              <strong>{detailUser.maNguoiDung || 'Chưa cập nhật'}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Họ tên">
              {[detailUser.hoNguoiDung, detailUser.tenDemNguoiDung, detailUser.tenNguoiDung].filter(Boolean).join(' ') || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {detailUser.email || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {detailUser.soDienThoai || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Chức vụ">
              {detailUser.chucVu || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Phòng ban">
              {detailUser.tenPhongBan || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Mã đơn vị">
              <Tag color="orange">Đơn vị {detailUser.idDonVi}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={detailUser.trangThai === 'HOAT_DONG' ? 'green' : 'red'}>
                {detailUser.trangThai === 'HOAT_DONG' ? 'Hoạt động' : 'Bị khóa'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò gán" span={2}>
              <Space wrap>
                {detailUser.danhSachVaiTro?.map(r => (
                  <Tag color="blue" key={r.id}>{r.tenVaiTro} ({r.maVaiTro})</Tag>
                )) || <Text type="secondary">Chưa gán vai trò</Text>}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Quyền hạn trực tiếp (Override)" span={2}>
              <Space wrap>
                {detailUser.danhSachQuyen?.map(q => (
                  <Tag color="purple" key={q.id}>{q.tenQuyen} ({q.maQuyen})</Tag>
                )) || <Text type="secondary">Không có quyền trực tiếp</Text>}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Danh sách quyền phân giải từ vai trò" span={2}>
              <Space wrap>
                {detailUser.danhSachQuyenPhanGiai?.map(q => (
                  <Tag color="cyan" key={q}>{q}</Tag>
                )) || <Text type="secondary">Không có quyền</Text>}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
});

export default UserManagementPage;
