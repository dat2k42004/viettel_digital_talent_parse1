import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, Tooltip, message } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { layDanhSach1, themMoi1, capNhat1, capNhatQuyen } from '../../../api-generated/endpoints/vai-tro-controller/vai-tro-controller';
import { layDanhSachQuyenPhanNhom } from '../../../api-generated/endpoints/quyen-controller/quyen-controller';
import type { VaiTroResponse } from '../../../api-generated/models/vaiTroResponse';
import type { QuyenResponse } from '../../../api-generated/models/quyenResponse';
import type { VaiTroRequest } from '../../../api-generated/models/vaiTroRequest';
import type { VaiTroQuyenUpdateRequest } from '../../../api-generated/models/vaiTroQuyenUpdateRequest';
import { RoleFormModal } from './RoleFormModal';
import { RoleMatrixModal } from './RoleMatrixModal';

const { Title, Text } = Typography;

export const RoleManagementPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [danhSachVaiTro, setDanhSachVaiTro] = useState<VaiTroResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  // Ma trận quyền hạn nạp từ API
  const [maTranQuyen, setMaTranQuyen] = useState<Record<string, QuyenResponse[]>>({});

  // Trạng thái các Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<VaiTroResponse | null>(null);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    taiDuLieu(currentPage, pageSize, searchText);
    taiMaTranQuyen();
  }, [currentPage, pageSize]);

  const taiDuLieu = async (page: number, size: number, search: string) => {
    setLoading(true);
    try {
      const res = await layDanhSach1({
        page: page - 1,
        size,
        tenVaiTro: search || undefined,
      });
      if (res.data) {
        setDanhSachVaiTro(res.data.content || []);
        setTotalCount(res.data.page_info?.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể tải danh sách vai trò từ máy chủ!');
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
      console.error('Không thể tải ma trận phân nhóm quyền', e);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    taiDuLieu(1, pageSize, searchText);
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
        message.success('Cập nhật thông tin vai trò thành công!');
      } else {
        await themMoi1(values);
        message.success('Thêm mới vai trò chức năng thành công!');
      }
      setIsEditModalOpen(false);
      taiDuLieu(currentPage, pageSize, searchText);
    } catch (e: any) {
      message.error(e?.message || 'Lưu thông tin vai trò thất bại!');
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
      message.success('Cập nhật ma trận phân quyền cho vai trò thành công!');
      setIsMatrixModalOpen(false);
      taiDuLieu(currentPage, pageSize, searchText);
    } catch (e: any) {
      message.error(e?.message || 'Lưu ma trận phân quyền thất bại!');
    }
  };

  const columns = [
    {
      title: 'Mã định danh vai trò',
      dataIndex: 'maVaiTro',
      key: 'maVaiTro',
      render: (val: string) => <Tag color="purple">{val}</Tag>
    },
    {
      title: 'Tên vai trò hiển thị',
      dataIndex: 'tenVaiTro',
      key: 'tenVaiTro',
      render: (val: string) => <strong>{val}</strong>
    },
    { title: 'Mô tả chi tiết', dataIndex: 'moTa', key: 'moTa', render: (val: string) => val || 'Chưa thiết lập mô tả' },
    {
      title: 'Tổng số quyền gán',
      dataIndex: 'danhSachQuyen',
      key: 'danhSachQuyen',
      render: (list?: any[]) => <Tag color="cyan">{list?.length || 0} Quyền hạn</Tag>,
    },
    {
      title: 'Tác vụ vai trò',
      key: 'hanhDong',
      render: (_: any, record: VaiTroResponse) => (
        <Space>
          <QuyenHanGuard quyenYeuCau="SUA_VAI_TRO">
            <Tooltip title="Chỉnh sửa vai trò">
              <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
            </Tooltip>
          </QuyenHanGuard>

          <QuyenHanGuard quyenYeuCau="CAP_NHAT_QUYEN_VAI_TRO">
            <Tooltip title="Thiết lập Ma trận quyền (Permission Matrix)">
              <Button size="small" type="primary" icon={<SafetyOutlined />} onClick={() => handleOpenMatrix(record)}>
                Phân quyền
              </Button>
            </Tooltip>
          </QuyenHanGuard>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontSize: 24 }}>Quản lý vai trò & phân quyền (IAM Matrix)</Title>
        <Text type="secondary">Cấu hình nhóm vai trò hệ thống, gán ma trận quyền hạn cho từng nhóm chức vụ bảo mật.</Text>
      </div>

      <Card
        title="Danh mục vai trò bảo mật hệ thống"
        extra={
          <QuyenHanGuard quyenYeuCau="THEM_VAI_TRO">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenEdit(null)}>
              Thêm mới vai trò
            </Button>
          </QuyenHanGuard>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo tên vai trò..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 280 }}
          />
          <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
        </Space>

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
        onSave={handleSaveVaiTro}
      />

      <RoleMatrixModal
        open={isMatrixModalOpen}
        onCancel={() => setIsMatrixModalOpen(false)}
        selectedRole={selectedRole}
        maTranQuyen={maTranQuyen}
        onSave={handleSaveMatrixQuyen}
      />
    </div>
  );
});

export default RoleManagementPage;
