import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select, DatePicker, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, CheckCircleOutlined, SendOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import {
    layDanhSach19 as layDanhSach,
    layTheoId18 as layTheoId,
    themMoi19 as themMoi,
    capNhat18 as capNhat,
    xoaMem18 as xoaMem,
    yeuCauPheDuyet5 as yeuCauPheDuyet,
    pheDuyet5 as pheDuyet,
    tuChoiPheDuyet4 as tuChoiPheDuyet
} from '../../../api-generated/endpoints/ke-hoach-bao-tri-controller/ke-hoach-bao-tri-controller';
import type { KeHoachBaoTriDinhKyResponse } from '../../../api-generated/models/keHoachBaoTriDinhKyResponse';
import type { KeHoachBaoTriDinhKyRequest } from '../../../api-generated/models/keHoachBaoTriDinhKyRequest';
import { KeHoachBaoTriFormModal } from './KeHoachBaoTriFormModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const KeHoachBaoTriPage: React.FC = observer(() => {
    const [loading, setLoading] = useState(false);
    const [danhSach, setDanhSach] = useState<KeHoachBaoTriDinhKyResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filters
    const [trangThai, setTrangThai] = useState<string | undefined>(undefined);
    const [dateRange, setDateRange] = useState<any>(null);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<KeHoachBaoTriDinhKyResponse | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

    // Reject Modal state
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [lyDoTuChoi, setLyDoTuChoi] = useState('');

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
            message.error(e?.message || 'Không thể tải danh sách kế hoạch bảo trì!');
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

    const handleOpenModal = async (mode: 'add' | 'edit' | 'view', record?: KeHoachBaoTriDinhKyResponse) => {
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
                message.error('Lỗi khi lấy chi tiết kế hoạch');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveForm = async (values: KeHoachBaoTriDinhKyRequest) => {
        setModalLoading(true);
        try {
            if (selectedItem && selectedItem.id) {
                const res = await capNhat(selectedItem.id, values);
                if (res.code === 200) {
                    message.success('Cập nhật kế hoạch thành công!');
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || 'Cập nhật thất bại!');
                }
            } else {
                const res = await themMoi(values);
                if (res.code === 200) {
                    message.success('Tạo kế hoạch bảo trì thành công!');
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || 'Thêm mới thất bại!');
                }
            }
        } catch (e: any) {
            message.error(e?.message || 'Có lỗi xảy ra khi lưu kế hoạch!');
        } finally {
            setModalLoading(false);
        }
    };

    const handleYeuCauPheDuyet = async (id: number) => {
        try {
            const res = await yeuCauPheDuyet(id);
            if (res.code === 200) {
                message.success('Đã gửi yêu cầu phê duyệt kế hoạch!');
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
                message.success('Phê duyệt kế hoạch thành công!');
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || 'Lỗi khi phê duyệt');
        }
    };

    const handleRejectClick = (id: number) => {
        setRejectId(id);
        setLyDoTuChoi('');
        setIsRejectModalOpen(true);
    };

    const handleConfirmReject = async () => {
        if (!lyDoTuChoi.trim()) {
            message.error('Vui lòng nhập lý do từ chối!');
            return;
        }
        if (rejectId === null) return;

        try {
            const res = await tuChoiPheDuyet(rejectId, { lyDoTuChoi: lyDoTuChoi.trim() });
            if (res.code === 200) {
                message.success('Đã từ chối phê duyệt kế hoạch!');
                setIsRejectModalOpen(false);
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || 'Lỗi khi từ chối phê duyệt');
        }
    };

    const handleXoa = async (id: number) => {
        try {
            const res = await xoaMem(id);
            if (res.code === 200) {
                message.success('Xóa kế hoạch bảo trì thành công!');
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể xóa kế hoạch!');
        }
    };

    const renderStatus = (status: string) => {
        switch (status) {
            case 'TAO_MOI':
                return <Tag color="cyan">Tạo mới</Tag>;
            case 'GUI_PHE_DUYET':
                return <Tag color="orange">Chờ phê duyệt</Tag>;
            case 'DA_PHE_DUYET':
                return <Tag color="blue">Đã phê duyệt</Tag>;
            case 'TU_CHOI':
                return <Tag color="red">Từ chối</Tag>;
            case 'HOAN_THANH':
                return <Tag color="green">Đã hoàn thành</Tag>;
            case 'HET_HAN':
                return <Tag color="default">Hết hạn</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const formatChuKy = (chuKy: string) => {
        switch (chuKy) {
            case 'HANG_TUAN': return 'Hàng tuần';
            case 'HANG_THANG': return 'Hàng tháng';
            case 'HANG_QUY': return 'Hàng quý';
            case 'HANG_NAM': return 'Hàng năm';
            default: return chuKy;
        }
    };

    const columns = [
        {
            title: 'Mã kế hoạch',
            dataIndex: 'maKeHoach',
            key: 'maKeHoach',
            width: 160,
            sorter: (a: KeHoachBaoTriDinhKyResponse, b: KeHoachBaoTriDinhKyResponse) => (a.maKeHoach || '').localeCompare(b.maKeHoach || ''),
            defaultSortOrder: 'ascend' as const,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: 'Tên kế hoạch',
            dataIndex: 'tenKeHoach',
            key: 'tenKeHoach',
        },
        {
            title: 'Chu kỳ',
            dataIndex: 'chuKyLap',
            key: 'chuKyLap',
            width: 120,
            render: (val: string) => formatChuKy(val),
        },
        {
            title: 'Bắt đầu',
            dataIndex: 'thoiGianBatDauKeHoach',
            key: 'thoiGianBatDauKeHoach',
            width: 120,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Kết thúc',
            dataIndex: 'thoiGianKetThucKeHoach',
            key: 'thoiGianKetThucKeHoach',
            width: 120,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Dự kiến (VNĐ)',
            dataIndex: 'chiPhiDuKien',
            key: 'chiPhiDuKien',
            width: 130,
            render: (val: number) => val ? val.toLocaleString('vi-VN') : '0',
        },
        {
            title: 'Người lập',
            dataIndex: 'tenNguoiLap',
            key: 'tenNguoiLap',
            width: 140,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trangThai',
            key: 'trangThai',
            width: 130,
            render: (val: string) => renderStatus(val),
        },
        {
            title: 'Hành động',
            key: 'hanhDong',
            width: 120,
            render: (_: any, record: KeHoachBaoTriDinhKyResponse) => {
                const isTaoMoi = record.trangThai === 'TAO_MOI';
                const isTuChoi = record.trangThai === 'TU_CHOI';
                const isChoDuyet = record.trangThai === 'GUI_PHE_DUYET';

                const items: MenuProps['items'] = [
                    authStore.kiemTraQuyen(QUYEN.XEM_CHI_TIET_KHBTDK)
                        ? {
                            key: 'view',
                            label: 'Xem chi tiết',
                            icon: <EyeOutlined />,
                            onClick: () => handleOpenModal('view', record),
                        } : null,

                    (isTaoMoi || isTuChoi) && authStore.kiemTraQuyen(QUYEN.CAP_NHAT_KHBTDK)
                        ? {
                            key: 'edit',
                            label: 'Chỉnh sửa',
                            icon: <EditOutlined />,
                            onClick: () => handleOpenModal('edit', record),
                        } : null,

                    (isTaoMoi || isTuChoi) && authStore.kiemTraQuyen(QUYEN.GUI_PHE_DUYET_KHBTDK)
                        ? {
                            key: 'request_approval',
                            label: 'Gửi phê duyệt',
                            icon: <SendOutlined />,
                            onClick: () => handleYeuCauPheDuyet(record.id!),
                        } : null,

                    isChoDuyet && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_KHBTDK)
                        ? {
                            key: 'approve',
                            label: 'Phê duyệt',
                            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                            onClick: () => handlePheDuyet(record.id!),
                        } : null,

                    isChoDuyet && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_KHBTDK)
                        ? {
                            key: 'reject',
                            label: 'Từ chối duyệt',
                            icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                            onClick: () => handleRejectClick(record.id!),
                        } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.XOA_KHBTDK)
                        ? {
                            key: 'delete',
                            label: (
                                <Popconfirm
                                    title="Xác nhận xóa"
                                    description="Xóa kế hoạch bảo trì này?"
                                    onConfirm={() => handleXoa(record.id!)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                >
                                    <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa kế hoạch</span>
                                </Popconfirm>
                            ),
                            icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                        } : null,
                ].filter(Boolean) as MenuProps['items'];

                if (items.length === 0) return '-';

                return (
                    <Dropdown menu={{ items }} trigger={['click']}>
                        <Button size="small">
                            Thao tác <DownOutlined />
                        </Button>
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <QuyenHanGuard quyenYeuCau={QUYEN.NHOM_KE_HOACH_BAO_TRI}>
            <div style={{ padding: 24, minHeight: 'calc(100vh - 112px)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Kế hoạch bảo trì định kỳ</Title>
                        <Text type="secondary">Quản lý lập kế hoạch, nội dung, phạm vi tài sản áp dụng bảo dưỡng định kỳ.</Text>
                    </div>
                    <QuyenHanGuard quyenYeuCau={QUYEN.THEM_MOI_KHBTDK}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('add')}>
                            Lập kế hoạch mới
                        </Button>
                    </QuyenHanGuard>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <Select
                                placeholder="Trạng thái kế hoạch"
                                style={{ width: '100%' }}
                                value={trangThai}
                                onChange={setTrangThai}
                                allowClear
                                options={[
                                    { value: 'TAO_MOI', label: 'Tạo mới' },
                                    { value: 'GUI_PHE_DUYET', label: 'Chờ phê duyệt' },
                                    { value: 'DA_PHE_DUYET', label: 'Đã phê duyệt' },
                                    { value: 'TU_CHOI', label: 'Từ chối' },
                                    { value: 'HOAN_THANH', label: 'Đã hoàn thành' },
                                    { value: 'HET_HAN', label: 'Hết hạn kế hoạch' },
                                ]}
                            />
                        </Col>
                        <Col xs={24} md={10}>
                            <RangePicker
                                style={{ width: '100%' }}
                                value={dateRange}
                                onChange={setDateRange}
                                placeholder={['Từ ngày lập', 'Đến ngày lập']}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <Space>
                                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>Tìm kiếm</Button>
                                <Button onClick={handleReset}>Làm mới</Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                <Card>
                    <Table
                        dataSource={danhSach}
                        columns={columns}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            current: currentPage,
                            pageSize,
                            total: totalCount,
                            onChange: (p, s) => { setCurrentPage(p); setPageSize(s); },
                            showSizeChanger: true,
                        }}
                    />
                </Card>

                <KeHoachBaoTriFormModal
                    open={isFormOpen}
                    loading={modalLoading}
                    selectedRecord={selectedItem}
                    mode={formMode}
                    onCancel={() => { setIsFormOpen(false); setSelectedItem(null); }}
                    onSave={handleSaveForm}
                />

                <Modal
                    title="Từ chối phê duyệt kế hoạch"
                    open={isRejectModalOpen}
                    onOk={handleConfirmReject}
                    onCancel={() => setIsRejectModalOpen(false)}
                    okText="Xác nhận từ chối"
                    okButtonProps={{ danger: true }}
                    cancelText="Hủy bỏ"
                >
                    <div style={{ marginTop: 16 }}>
                        <Text strong>Lý do từ chối phê duyệt kế hoạch này:</Text>
                        <Input.TextArea
                            rows={4}
                            placeholder="Vui lòng nhập lý do cụ thể..."
                            value={lyDoTuChoi}
                            onChange={(e) => setLyDoTuChoi(e.target.value)}
                            style={{ marginTop: 8 }}
                        />
                    </div>
                </Modal>
            </div>
        </QuyenHanGuard>
    );
});

export default KeHoachBaoTriPage;
