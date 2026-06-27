import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Switch, Tooltip, message, Popconfirm, Typography } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, SafetyOutlined, LockOutlined, UnlockOutlined, KeyOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { layDanhSach15, themMoi15, capNhat15, capNhatTrangThai9, capNhatQuyen1, thuHoiPhien } from '../../../api-generated/endpoints/nguoi-dung-controller/nguoi-dung-controller';
import { layDropdown } from '../../../api-generated/endpoints/vai-tro-controller/vai-tro-controller';
import { layDanhSachQuyen } from '../../../api-generated/endpoints/quyen-controller/quyen-controller';
import type { NguoiDungResponse } from '../../../api-generated/models/nguoiDungResponse';
import type { VaiTroDropdownResponse } from '../../../api-generated/models/vaiTroDropdownResponse';
import type { QuyenResponse } from '../../../api-generated/models/quyenResponse';
import type { NguoiDungRequest } from '../../../api-generated/models/nguoiDungRequest';
import type { NguoiDungQuyenUpdateRequest } from '../../../api-generated/models/nguoiDungQuyenUpdateRequest';
import { UserFormModal } from './UserFormModal';
import { UserQuyenModal } from './UserQuyenModal';

const { Title, Text } = Typography;

export const UserManagementPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [danhSachNguoiDung, setDanhSachNguoiDung] = useState<NguoiDungResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  // Danh sách vai trò và quyền tải từ API
  const [danhSachVaiTro, setDanhSachVaiTro] = useState<VaiTroDropdownResponse[]>([]);
  const [danhSachQuyen, setDanhSachQuyen] = useState<QuyenResponse[]>([]);

  // Trạng thái các Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQuyenModalOpen, setIsQuyenModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<NguoiDungResponse | null>(null);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    taiDuLieu(currentPage, pageSize, searchText);
    taiVaiTroDropdown();
    taiTatCaQuyen();
  }, [currentPage, pageSize]);

  const taiDuLieu = async (page: number, size: number, search: string) => {
    setLoading(true);
    try {
      const res = await layDanhSach15({
        page: page - 1,
        size,
        search: search || undefined,
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
    taiDuLieu(1, pageSize, searchText);
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
      taiDuLieu(currentPage, pageSize, searchText);
    } catch (e: any) {
      message.error(e?.message || 'Lưu thông tin thất bại, vui lòng kiểm tra lại!');
    }
  };

  // Khóa / Kích hoạt tài khoản người dùng
  const handleToggleTrangThai = async (user: NguoiDungResponse, active: boolean) => {
    if (!user.id) return;
    const trangThaiMoi = active ? 'HOAT_DONG' : 'BI_KHOA';
    try {
      await capNhatTrangThai9(user.id, { trangThai: trangThaiMoi });
      message.success(`Đổi trạng thái tài khoản người dùng sang ${active ? 'Hoạt động' : 'Bị khóa'} thành công!`);
      taiDuLieu(currentPage, pageSize, searchText);
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
      taiDuLieu(currentPage, pageSize, searchText);
    } catch (e: any) {
      message.error(e?.message || 'Cập nhật quyền trực tiếp thất bại!');
    }
  };

  const columns = [
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
      render: (val: string, record: NguoiDungResponse) => (
        <QuyenHanGuard quyenYeuCau="CAP_NHAT_TRANG_THAI_NGUOI_DUNG" fallback={<Tag color={val === 'HOAT_DONG' ? 'green' : 'red'}>{val === 'HOAT_DONG' ? 'Đang hoạt động' : 'Bị khóa'}</Tag>}>
          <Switch
            checkedChildren={<UnlockOutlined />}
            unCheckedChildren={<LockOutlined />}
            checked={val === 'HOAT_DONG'}
            onChange={(checked) => handleToggleTrangThai(record, checked)}
          />
        </QuyenHanGuard>
      ),
    },
    {
      title: 'Thao tác tác vụ',
      key: 'hanhDong',
      render: (_: any, record: NguoiDungResponse) => (
        <Space>
          <QuyenHanGuard quyenYeuCau="SUA_NGUOI_DUNG">
            <Tooltip title="Chỉnh sửa tài khoản">
              <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
            </Tooltip>
          </QuyenHanGuard>

          <QuyenHanGuard quyenYeuCau="CAP_NHAT_QUYEN_NGUOI_DUNG">
            <Tooltip title="Gán quyền trực tiếp">
              <Button size="small" icon={<KeyOutlined />} onClick={() => handleOpenQuyenTrucTiep(record)} />
            </Tooltip>
          </QuyenHanGuard>

          <QuyenHanGuard quyenYeuCau="CAP_NHAT_TRANG_THAI_NGUOI_DUNG">
            <Popconfirm
              title="Xác nhận cưỡng chế thoát?"
              description="Thu hồi toàn bộ phiên đăng nhập của người dùng này khỏi Redis?"
              onConfirm={() => record.id && handleCuongCheLogout(record.id)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Tooltip title="Cưỡng chế đăng xuất">
                <Button size="small" danger icon={<SafetyOutlined />} />
              </Tooltip>
            </Popconfirm>
          </QuyenHanGuard>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontSize: 24 }}>Quản lý tài khoản người dùng</Title>
        <Text type="secondary">Cấp phát tài khoản nhân viên, khóa/mở quyền hệ thống, cưỡng chế thoát phiên và ghi đè cấp quyền trực tiếp.</Text>
      </div>

      <Card
        title="Danh sách người dùng quản trị tài sản"
        extra={
          <QuyenHanGuard quyenYeuCau="THEM_NGUOI_DUNG">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenEdit(null)}>
              Thêm mới tài khoản
            </Button>
          </QuyenHanGuard>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo họ tên, email, tài khoản..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 300 }}
          />
          <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
        </Space>

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
        danhSachVaiTro={danhSachVaiTro}
        onSave={handleSaveNguoiDung}
      />

      <UserQuyenModal
        open={isQuyenModalOpen}
        onCancel={() => setIsQuyenModalOpen(false)}
        selectedUser={selectedUser}
        danhSachQuyen={danhSachQuyen}
        onSave={handleSaveQuyenTrucTiep}
      />
    </div>
  );
});

export default UserManagementPage;
