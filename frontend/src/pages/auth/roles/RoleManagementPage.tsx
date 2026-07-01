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
      message.error(e?.message || 'Không thể tải thông tin chi tiết vai trò!');
    }
  };

  const handleXoaVaiTro = async (id: number) => {
    try {
      await xoaMem1(id);
      message.success('Xóa vai trò thành công!');
      taiDuLieu(currentPage, pageSize, searchText, filterMaVaiTro, filterTrangThai);
    } catch (e: any) {
      message.error(e?.message || 'Không thể xóa vai trò!');
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
      console.error('Không thể tải danh sách đơn vị', e);
    }
  };

  const taiTatCaQuyen = async () => {
    try {
      const res = await layDanhSachQuyen();
      if (res.data) {
        setDanhSachQuyen(res.data);
      }
    } catch (e) {
      console.error('Không thể tải danh sách quyền', e);
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
        message.success('Cập nhật thông tin vai trò thành công!');
      } else {
        await themMoi1(values);
        message.success('Thêm mới vai trò chức năng thành công!');
      }
      setIsEditModalOpen(false);
      taiDuLieu(currentPage, pageSize, searchText, filterMaVaiTro, filterTrangThai);
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
      taiDuLieu(currentPage, pageSize, searchText, filterMaVaiTro, filterTrangThai);
    } catch (e: any) {
      message.error(e?.message || 'Lưu ma trận phân quyền thất bại!');
    }
  };

  const columns = [
    ...(authStore.laSuperAdmin
      ? [
        {
          title: 'Đơn vị (SaaS)',
          dataIndex: 'idDonVi',
          key: 'idDonVi',
          render: (val: any) => <Tag color="orange">Đơn vị {val}</Tag>,
        },
      ]
      : []),
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
    {
      title: 'Phân loại',
      dataIndex: 'laHeThong',
      key: 'laHeThong',
      render: (val: boolean) => (
        <Tag color={val ? 'blue' : 'default'}>{val ? 'Hệ thống' : 'Tùy biến'}</Tag>
      ),
    },
    ...(authStore.laSuperAdmin ? [{
      title: 'Đơn vị áp dụng',
      dataIndex: 'idDonVi',
      key: 'idDonVi',
      render: (val?: number) => {
        if (!val) return <Tag color="blue">Hệ thống</Tag>;
        const dv = danhSachDonVi.find(d => d.id === val);
        return <span>{dv?.tenPhapLy || `Đơn vị (ID: ${val})`}</span>;
      }
    }] : []),
    {
      title: 'Mức ưu tiên',
      dataIndex: 'capDoUuTien',
      key: 'capDoUuTien',
      sorter: (a: VaiTroResponse, b: VaiTroResponse) => (a.capDoUuTien || 0) - (b.capDoUuTien || 0),
      render: (val: number) => <Tag color="cyan">Cấp {val || 0}</Tag>
    },
    { title: 'Mô tả chi tiết', dataIndex: 'moTa', key: 'moTa', render: (val: string) => val || 'Chưa thiết lập mô tả' },
    {
      title: 'Tổng số quyền gán',
      dataIndex: 'danhSachQuyen',
      key: 'danhSachQuyen',
      render: (list?: any[]) => <Tag color="cyan">{list?.length || 0} Quyền hạn</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (val: string) => (
        <Tag color={val === 'HOAT_DONG' ? 'green' : 'red'}>
          {val === 'HOAT_DONG' ? 'Hoạt động' : 'Bị khóa'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'hanhDong',
      render: (_: any, record: VaiTroResponse) => {
        const actItems: MenuProps['items'] = [
          {
            key: 'detail',
            icon: <EyeOutlined />,
            label: 'Xem chi tiết',
            onClick: () => record.id && handleOpenDetail(record.id),
          },
          authStore.kiemTraQuyen('SUA_VAI_TRO') && {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Chỉnh sửa vai trò',
            onClick: () => handleOpenEdit(record),
          },
          authStore.kiemTraQuyen('CAP_NHAT_QUYEN_VAI_TRO') && {
            key: 'matrix',
            icon: <SafetyOutlined />,
            label: 'Thiết lập ma trận quyền',
            onClick: () => handleOpenMatrix(record),
          },
          authStore.kiemTraQuyen('XOA_VAI_TRO') && {
            key: 'delete',
            label: (
              <Popconfirm
                title="Xác nhận xóa vai trò?"
                description="Bạn có chắc chắn muốn xóa vai trò này không?"
                onConfirm={() => record.id && handleXoaVaiTro(record.id)}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>
                  <DeleteOutlined style={{ marginRight: 8 }} /> Xóa vai trò
                </span>
              </Popconfirm>
            ),
          },
        ].filter(Boolean) as MenuProps['items'];

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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: 24 }}>Quản lý vai trò & phân quyền (IAM Matrix)</Title>
          <Text type="secondary">Cấu hình nhóm vai trò hệ thống, gán ma trận quyền hạn cho từng nhóm chức vụ bảo mật.</Text>
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
              placeholder="Tìm kiếm tên vai trò..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Mã vai trò..."
              value={filterMaVaiTro}
              onChange={(e) => setFilterMaVaiTro(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={5}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              value={filterTrangThai}
              onChange={setFilterTrangThai}
              allowClear
            >
              <Select.Option value="HOAT_DONG">Hoạt động</Select.Option>
              <Select.Option value="BI_KHOA">Bị khóa</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={5}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button type="primary" onClick={handleSearch}>Lọc</Button>
              <Button onClick={handleResetFilters}>Reset</Button>
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
        title="Chi tiết vai trò chức năng"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={650}
      >
        {detailRole && (
          <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="Mã định danh vai trò">
              <Tag color="purple">{detailRole.maVaiTro}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tên vai trò hiển thị">
              <strong>{detailRole.tenVaiTro}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {detailRole.moTa || 'Không có mô tả'}
            </Descriptions.Item>
            <Descriptions.Item label="Phân loại">
              <Tag color={detailRole.laHeThong ? 'blue' : 'default'}>{detailRole.laHeThong ? 'Vai trò hệ thống' : 'Vai trò tùy biến'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Độ ưu tiên">
              Cấp {detailRole.capDoUuTien || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={detailRole.trangThai === 'HOAT_DONG' ? 'green' : 'red'}>{detailRole.trangThai === 'HOAT_DONG' ? 'Hoạt động' : 'Bị khóa'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn vị gán">
              <Tag color="orange">
                {!detailRole.idDonVi ? 'Hệ thống (Toàn sàn)' : (danhSachDonVi.find(d => d.id === detailRole.idDonVi)?.tenPhapLy || `Đơn vị (ID: ${detailRole.idDonVi})`)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Quyền hạn của vai trò">
              <Space wrap>
                {detailRole.danhSachQuyen?.map(q => (
                  <Tag color="cyan" key={q.id}>{q.tenQuyen} ({q.maQuyen})</Tag>
                )) || <Text type="secondary">Chưa cấu hình quyền</Text>}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
});

export default RoleManagementPage;
