import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Switch, Tooltip, message, Popconfirm, Typography, Modal, Descriptions } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, SafetyOutlined, LockOutlined, UnlockOutlined, KeyOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { layDanhSach15, themMoi15, capNhat15, capNhatTrangThai9, capNhatQuyen1, thuHoiPhien, layTheoId15, xoaMem15 } from '../../../api-generated/endpoints/nguoi-dung-controller/nguoi-dung-controller';
import { layDropdown } from '../../../api-generated/endpoints/vai-tro-controller/vai-tro-controller';
import { layDanhSachQuyen } from '../../../api-generated/endpoints/quyen-controller/quyen-controller';
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
  const [searchText, setSearchText] = useState('');

  // Danh sách vai trò và quyền tải từ API
  const [danhSachVaiTro, setDanhSachVaiTro] = useState<VaiTroDropdownResponse[]>([]);
  const [danhSachQuyen, setDanhSachQuyen] = useState<QuyenResponse[]>([]);

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
      taiDuLieu(currentPage, pageSize, searchText);
    } catch (e: any) {
      message.error(e?.message || 'Không thể xóa tài khoản người dùng!');
    }
  };

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
        const coQuyenTacDong = !authStore.laSuperAdmin || laAdminDonViRecord(record);
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
      title: 'Thao tác tác vụ',
      key: 'hanhDong',
      render: (_: any, record: NguoiDungResponse) => {
        const coQuyenTacDong = !authStore.laSuperAdmin || laAdminDonViRecord(record);
        if (!coQuyenTacDong) {
          return (
            <Space>
              <Tooltip title="Xem chi tiết tài khoản">
                <Button size="small" icon={<EyeOutlined />} onClick={() => record.id && handleOpenDetail(record.id)} />
              </Tooltip>
              <Text type="secondary" style={{ fontSize: 12 }}>Khóa cứng UI</Text>
            </Space>
          );
        }
        return (
          <Space>
            <Tooltip title="Xem chi tiết tài khoản">
              <Button size="small" icon={<EyeOutlined />} onClick={() => record.id && handleOpenDetail(record.id)} />
            </Tooltip>

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

            <QuyenHanGuard quyenYeuCau="XOA_NGUOI_DUNG">
              <Popconfirm
                title="Xác nhận xóa tài khoản?"
                description="Bạn có chắc chắn muốn xóa tài khoản người dùng này không?"
                onConfirm={() => record.id && handleXoaNguoiDung(record.id)}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Xóa người dùng">
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Tooltip>
              </Popconfirm>
            </QuyenHanGuard>
          </Space>
        );
      },
    },
  ];

  // Lọc vai trò gán được trong Modal Form
  const vaiTroDuocGan = authStore.laSuperAdmin
    ? danhSachVaiTro.filter(v => v.maVaiTro?.toUpperCase().includes('ADMIN') && !v.maVaiTro?.toUpperCase().includes('SUPER'))
    : danhSachVaiTro;

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
        danhSachVaiTro={vaiTroDuocGan}
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
