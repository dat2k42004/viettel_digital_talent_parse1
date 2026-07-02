import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select, DatePicker } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import {
    layDanhSach21 as layDanhSach,
    layTheoId20 as layTheoId,
    themMoi21 as themMoi,
    capNhat20 as capNhat,
    xoaMem20 as xoaMem,
    yeuCauPheDuyet6 as yeuCauPheDuyet,
    pheDuyet6 as pheDuyet
} from '../../../api-generated/endpoints/dot-kiem-ke-controller/dot-kiem-ke-controller';
import type { DotKiemKeResponse } from '../../../api-generated/models/dotKiemKeResponse';
import type { DotKiemKeRequest } from '../../../api-generated/models/dotKiemKeRequest';
import { DotKiemKeFormModal } from './DotKiemKeFormModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const DotKiemKePage: React.FC = observer(() => {
    const [loading, setLoading] = useState(false);
    const [danhSach, setDanhSach] = useState<DotKiemKeResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filters
    const [trangThai, setTrangThai] = useState<string | undefined>(undefined);
    const [dateRange, setDateRange] = useState<any>(null);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DotKiemKeResponse | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

    const taiDuLieu = async (page: number, size: number) => {
        setLoading(true);
        try {
            const res = await layDanhSach({
                page: page - 1,
                size,
                trangThai: trangThai || undefined,
                tuNgay: dateRange?.[0] ? dayjs(dateRange[0]).format('YYYY-MM-DD') : undefined,
                denNgay: dateRange?.[1] ? dayjs(dateRange[1]).format('YYYY-MM-DD') : undefined,
            });
            if (res.code === 200 && res.data) {
                const content = (res.data as any).content || [];
                const pageInfo = (res.data as any).page_info || {};
                setDanhSach(content);
                setTotalCount(pageInfo.total_elements || 0);
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể tải danh sách đợt kiểm kê!');
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
        setTrangThai(undefined);
        setDateRange(null);
        setCurrentPage(1);
        taiDuLieu(1, pageSize);
    };

    const handleOpenModal = async (mode: 'add' | 'edit' | 'view', record?: DotKiemKeResponse) => {
        setFormMode(mode);
        if (mode === 'add') {
            setSelectedItem(null);
            setIsFormOpen(true);
        } else if (record && record.id) {
            setLoading(true);
            try {
                const detailRes = await layTheoId(record.id);
                if (detailRes.data) {
                    setSelectedItem(detailRes.data);
                    setIsFormOpen(true);
                }
            } catch (error) {
                message.error('Lỗi khi lấy chi tiết đợt kiểm kê');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveForm = async (values: DotKiemKeRequest) => {
        setModalLoading(true);
        try {
            if (selectedItem && selectedItem.id) {
                const res = await capNhat(selectedItem.id, values);
                if (res.code === 200) {
                    message.success('Cập nhật đợt kiểm kê thành công!');
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || 'Cập nhật thất bại!');
                }
            } else {
                const res = await themMoi(values);
                if (res.code === 200) {
                    message.success('Tạo đợt kiểm kê thành công!');
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || 'Thêm mới thất bại!');
                }
            }
        } catch (e: any) {
            message.error(e?.message || 'Có lỗi xảy ra khi lưu đợt kiểm kê!');
        } finally {
            setModalLoading(false);
        }
    };

    const handleYeuCauPheDuyet = async (id: number) => {
        try {
            const res = await yeuCauPheDuyet(id);
            if (res.code === 200) {
                message.success('Đã gửi yêu cầu phê duyệt đợt kiểm kê!');
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || 'Lỗi khi gửi phê duyệt');
        }
    };

    const handlePheDuyet = async (id: number) => {
        try {
            const res = await pheDuyet(id);
            if (res.code === 200) {
                message.success('Phê duyệt đợt kiểm kê thành công!');
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || 'Lỗi khi phê duyệt');
        }
    };

    const handleXoa = async (id: number) => {
        try {
            const res = await xoaMem(id);
            if (res.code === 200) {
                message.success('Xóa đợt kiểm kê thành công!');
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể xóa đợt kiểm kê!');
        }
    };

    const renderStatus = (status?: string) => {
        switch (status) {
            case 'TAO_MOI': return <Tag color="cyan">Tạo mới</Tag>;
            case 'GUI_PHE_DUYET': return <Tag color="orange">Chờ phê duyệt</Tag>;
            case 'DA_PHE_DUYET': return <Tag color="blue">Đã phê duyệt</Tag>;
            case 'DANG_THUC_HIEN': return <Tag color="purple">Đang thực hiện</Tag>;
            case 'HOAN_THANH': return <Tag color="green">Hoàn thành</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: 'Mã đợt',
            dataIndex: 'maDotKiemKe',
            key: 'maDotKiemKe',
            width: 140,
            sorter: (a: DotKiemKeResponse, b: DotKiemKeResponse) => (a.maDotKiemKe || '').localeCompare(b.maDotKiemKe || ''),
            defaultSortOrder: 'ascend' as const,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: 'Tên đợt kiểm kê',
            dataIndex: 'tenDotKiemKe',
            key: 'tenDotKiemKe',
        },
        {
            title: 'Người lập',
            dataIndex: 'tenNguoiLap',
            key: 'tenNguoiLap',
            width: 150,
        },
        {
            title: 'Người phê duyệt',
            dataIndex: 'tenNguoiPheDuyet',
            key: 'tenNguoiPheDuyet',
            width: 150,
            render: (val: string) => val || '-',
        },
        {
            title: 'Bắt đầu dự kiến',
            dataIndex: 'thoiGianBatDauDuKien',
            key: 'thoiGianBatDauDuKien',
            width: 140,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Kết thúc dự kiến',
            dataIndex: 'thoiGianKetThucDuKien',
            key: 'thoiGianKetThucDuKien',
            width: 140,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'TS Hệ thống',
            dataIndex: 'tongTaiSanHeThong',
            key: 'tongTaiSanHeThong',
            width: 110,
            render: (val: number) => val ?? 0,
        },
        {
            title: 'TS Thực tế',
            dataIndex: 'tongTaiSanThucTe',
            key: 'tongTaiSanThucTe',
            width: 110,
            render: (val: number) => val ?? 0,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trangThai',
            key: 'trangThai',
            width: 135,
            render: (val: string) => renderStatus(val),
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 120,
            fixed: 'right' as const,
            render: (_: any, record: DotKiemKeResponse) => {
                const canEdit = authStore.kiemTraQuyen(QUYEN.CAP_NHAT_DKK) && record.trangThai === 'TAO_MOI';
                const canDelete = authStore.kiemTraQuyen(QUYEN.XOA_DKK) && record.trangThai === 'TAO_MOI';
                const canRequestApprove = authStore.kiemTraQuyen(QUYEN.GUI_PHE_DUYET_DKK) && record.trangThai === 'TAO_MOI';
                const canApprove = authStore.kiemTraQuyen(QUYEN.PHE_DUYET_DKK) && record.trangThai === 'GUI_PHE_DUYET';

                const items: MenuProps['items'] = [
                    {
                        key: 'view',
                        label: 'Xem chi tiết',
                        icon: <EyeOutlined />,
                        onClick: () => handleOpenModal('view', record),
                    },
                    canEdit ? {
                        key: 'edit',
                        label: 'Sửa thông tin',
                        icon: <EditOutlined />,
                        onClick: () => handleOpenModal('edit', record),
                    } : null,
                    canRequestApprove ? {
                        key: 'send',
                        label: 'Gửi phê duyệt',
                        icon: <SendOutlined />,
                        onClick: () => handleYeuCauPheDuyet(record.id!),
                    } : null,
                    canApprove ? {
                        key: 'approve',
                        label: 'Phê duyệt',
                        icon: <CheckCircleOutlined />,
                        onClick: () => handlePheDuyet(record.id!),
                    } : null,
                    canDelete ? {
                        type: 'divider',
                    } : null,
                    canDelete ? {
                        key: 'delete',
                        label: (
                            <Popconfirm
                                title="Bạn chắc chắn muốn xóa đợt kiểm kê này?"
                                onConfirm={() => handleXoa(record.id!)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <span style={{ color: '#ff4d4f' }}>Xóa bỏ</span>
                            </Popconfirm>
                        ),
                        icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                    } : null,
                ].filter(Boolean) as MenuProps['items'];

                return (
                    <Dropdown menu={{ items }} trigger={['click']}>
                        <Button type="text" size="small">
                            Hành động <DownOutlined />
                        </Button>
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>Quản lý Đợt kiểm kê tài sản</Title>
                    <Text type="secondary">Quản lý và lập kế hoạch các chiến dịch kiểm kê tài sản công nghệ thông tin định kỳ</Text>
                </div>
                <QuyenHanGuard quyenYeuCau={QUYEN.THEM_MOI_DKK}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('add')}>
                        Thêm mới đợt kiểm kê
                    </Button>
                </QuyenHanGuard>
            </div>

            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>Trạng thái</div>
                        <Select
                            placeholder="Tất cả trạng thái"
                            style={{ width: '100%' }}
                            allowClear
                            value={trangThai}
                            onChange={setTrangThai}
                        >
                            <Select.Option value="TAO_MOI">Tạo mới</Select.Option>
                            <Select.Option value="GUI_PHE_DUYET">Chờ phê duyệt</Select.Option>
                            <Select.Option value="DA_PHE_DUYET">Đã phê duyệt</Select.Option>
                            <Select.Option value="DANG_THUC_HIEN">Đang thực hiện</Select.Option>
                            <Select.Option value="HOAN_THANH">Hoàn thành</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={10} md={8}>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>Thời gian bắt đầu/kết thúc</div>
                        <RangePicker
                            style={{ width: '100%' }}
                            value={dateRange}
                            onChange={setDateRange}
                            placeholder={['Từ ngày', 'Đến ngày']}
                            format="DD/MM/YYYY"
                        />
                    </Col>
                    <Col xs={24} sm={6} md={6} style={{ display: 'flex', alignItems: 'flex-end', paddingTop: 24 }}>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                                Tìm kiếm
                            </Button>
                            <Button onClick={handleReset}>
                                Làm mới
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Card>
                <Table
                    loading={loading}
                    dataSource={danhSach}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalCount,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20', '50'],
                        showTotal: (total) => `Tổng số ${total} bản ghi`,
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        }
                    }}
                />
            </Card>

            <DotKiemKeFormModal
                open={isFormOpen}
                onCancel={() => setIsFormOpen(false)}
                selectedRecord={selectedItem}
                mode={formMode}
                onSave={handleSaveForm}
                loading={modalLoading}
            />
        </div>
    );
});

export default DotKiemKePage;
