import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select, DatePicker, Modal, Form, InputNumber } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, CheckCircleOutlined, SendOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import {
    layDanhSach9 as layDanhSach,
    layTheoId9 as layTheoId,
    themMoi9 as themMoi,
    capNhat9 as capNhat,
    xoaMem9 as xoaMem,
    yeuCauPheDuyet2 as yeuCauPheDuyet,
    pheDuyet2 as pheDuyet,
    capNhatTienDoThucHien
} from '../../../api-generated/endpoints/phieu-sua-chua-bao-tri-controller/phieu-sua-chua-bao-tri-controller';
import type { PhieuSuaChuaBaoTriResponse } from '../../../api-generated/models/phieuSuaChuaBaoTriResponse';
import type { PhieuSuaChuaBaoTriRequest } from '../../../api-generated/models/phieuSuaChuaBaoTriRequest';
import type { ChiTietBaoTriGeneralResponse } from '../../../api-generated/models/chiTietBaoTriGeneralResponse';
import { PhieuSuaChuaFormModal } from './PhieuSuaChuaFormModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const PhieuSuaChuaPage: React.FC = observer(() => {
    const [loading, setLoading] = useState(false);
    const [danhSach, setDanhSach] = useState<PhieuSuaChuaBaoTriResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filters
    const [trangThai, setTrangThai] = useState<string | undefined>(undefined);
    const [dateRange, setDateRange] = useState<any>(null);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PhieuSuaChuaBaoTriResponse | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

    // Progress Modal state
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [progressItems, setProgressItems] = useState<ChiTietBaoTriGeneralResponse[]>([]);
    const [progressFormValues, setProgressFormValues] = useState<Record<number, {
        trangThaiThucHienMoi: string;
        phuongAnXuLy?: string;
        chiPhiThucTe?: number;
    }>>({});

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
            message.error(e?.message || 'Không thể tải danh sách phiếu sửa chữa!');
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

    const handleOpenModal = async (mode: 'add' | 'edit' | 'view', record?: PhieuSuaChuaBaoTriResponse) => {
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
                message.error('Lỗi khi lấy chi tiết phiếu');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveForm = async (values: PhieuSuaChuaBaoTriRequest) => {
        setModalLoading(true);
        try {
            if (selectedItem && selectedItem.id) {
                const res = await capNhat(selectedItem.id, values);
                if (res.code === 200) {
                    message.success('Cập nhật phiếu thành công!');
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || 'Cập nhật thất bại!');
                }
            } else {
                const res = await themMoi(values);
                if (res.code === 200) {
                    message.success('Tạo phiếu sửa chữa bảo trì thành công!');
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || 'Thêm mới thất bại!');
                }
            }
        } catch (e: any) {
            message.error(e?.message || 'Có lỗi xảy ra khi lưu thông tin!');
        } finally {
            setModalLoading(false);
        }
    };

    const handleYeuCauPheDuyet = async (id: number) => {
        try {
            const res = await yeuCauPheDuyet(id);
            if (res.code === 200) {
                message.success('Đã gửi yêu cầu phê duyệt phiếu!');
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
                message.success('Phê duyệt phiếu sửa chữa thành công!');
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || 'Lỗi khi phê duyệt');
        }
    };

    const handleOpenProgressModal = async (record: PhieuSuaChuaBaoTriResponse) => {
        setLoading(true);
        try {
            const detailRes = await layTheoId(record.id!);
            if (detailRes.data) {
                setSelectedItem(detailRes.data);
                const items = detailRes.data.chiTietTaiSan || [];
                setProgressItems(items);

                // Initialize form values
                const initValues: Record<number, any> = {};
                items.forEach(item => {
                    initValues[item.id!] = {
                        trangThaiThucHienMoi: item.trangThaiThucHien || 'CHUA_GUI_DI',
                        phuongAnXuLy: item.phuongAnXuLy || '',
                        chiPhiThucTe: item.chiPhi ? Number(item.chiPhi) : 0,
                    };
                });
                setProgressFormValues(initValues);
                setIsProgressModalOpen(true);
            }
        } catch (error) {
            message.error('Lỗi khi tải chi tiết tiến độ thực hiện');
        } finally {
            setLoading(false);
        }
    };

    const handleProgressValueChange = (itemId: number, field: string, value: any) => {
        setProgressFormValues(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value,
            }
        }));
    };

    const handleSaveProgress = async () => {
        if (!selectedItem || !selectedItem.id) return;
        setModalLoading(true);
        try {
            const payload = Object.entries(progressFormValues).map(([id, val]) => {
                const matchedItem = progressItems.find(item => String(item.id) === id);
                return {
                    idChiTiet: Number(id),
                    loaiChiTiet: matchedItem?.loai || 'THIET_BI',
                    trangThaiThucHienMoi: val.trangThaiThucHienMoi,
                    phuongAnXuLy: val.phuongAnXuLy || undefined,
                    chiPhiThucTe: val.chiPhiThucTe || 0,
                };
            });

            const res = await capNhatTienDoThucHien(selectedItem.id, payload as any);
            if (res.code === 200) {
                message.success('Cập nhật tiến độ thực hiện sửa chữa thành công!');
                setIsProgressModalOpen(false);
                taiDuLieu(currentPage, pageSize);
            } else {
                message.error(res.message || 'Cập nhật tiến độ thất bại!');
            }
        } catch (e: any) {
            message.error(e?.message || 'Lỗi khi cập nhật tiến độ');
        } finally {
            setModalLoading(false);
        }
    };

    const handleXoa = async (id: number) => {
        try {
            const res = await xoaMem(id);
            if (res.code === 200) {
                message.success('Xóa phiếu sửa chữa thành công!');
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể xóa phiếu!');
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
            case 'DANG_THUC_HIEN':
                return <Tag color="purple">Đang thực hiện</Tag>;
            case 'HOAN_THANH':
                return <Tag color="green">Hoàn thành</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const renderItemStatus = (status: string) => {
        switch (status) {
            case 'CHUA_GUI_DI': return <Tag color="default">Chưa gửi đi</Tag>;
            case 'DA_GUI_DI': return <Tag color="warning">Đã gửi đi sửa</Tag>;
            case 'DA_THU_LAI': return <Tag color="success">Đã thu hồi / Xử lý xong</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: 'Mã phiếu',
            dataIndex: 'maPhieuSuaChua',
            key: 'maPhieuSuaChua',
            width: 160,
            sorter: (a: PhieuSuaChuaBaoTriResponse, b: PhieuSuaChuaBaoTriResponse) => (a.maPhieuSuaChua || '').localeCompare(b.maPhieuSuaChua || ''),
            defaultSortOrder: 'ascend' as const,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: 'Mã kế hoạch liên kết',
            dataIndex: 'maKeHoachBaoTri',
            key: 'maKeHoachBaoTri',
            width: 160,
            render: (val: string) => val,
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'thoiGianBatDau',
            key: 'thoiGianBatDau',
            width: 120,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Hoàn thành DK',
            dataIndex: 'thoiGianHoanThanhDuKien',
            key: 'thoiGianHoanThanhDuKien',
            width: 130,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Hoàn thành TT',
            dataIndex: 'thoiGianHoanThanhThucTe',
            key: 'thoiGianHoanThanhThucTe',
            width: 130,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Tổng chi phí (VNĐ)',
            dataIndex: 'tongChiPhiThucHien',
            key: 'tongChiPhiThucHien',
            width: 150,
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
            render: (_: any, record: PhieuSuaChuaBaoTriResponse) => {
                const isTaoMoi = record.trangThai === 'TAO_MOI';
                const isChoDuyet = record.trangThai === 'GUI_PHE_DUYET';
                const isDuyetOrThucHien = record.trangThai === 'DA_PHE_DUYET' || record.trangThai === 'DANG_THUC_HIEN';

                const items: MenuProps['items'] = [
                    authStore.kiemTraQuyen(QUYEN.XEM_CHI_TIET_PHIEU_SUA_CHUA_BAO_TRI)
                        ? {
                            key: 'view',
                            label: 'Xem chi tiết',
                            icon: <EyeOutlined />,
                            onClick: () => handleOpenModal('view', record),
                        } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.CAP_NHAT_PHIEU_SUA_CHUA_BAO_TRI)
                        ? {
                            key: 'edit',
                            label: 'Chỉnh sửa',
                            icon: <EditOutlined />,
                            onClick: () => handleOpenModal('edit', record),
                        } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.GUI_PHE_DUYET_PHIEU_SUA_CHUA_BAO_TRI)
                        ? {
                            key: 'request_approval',
                            label: 'Gửi phê duyệt',
                            icon: <SendOutlined />,
                            onClick: () => handleYeuCauPheDuyet(record.id!),
                        } : null,

                    isChoDuyet && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_PHIEU_SUA_CHUA_BAO_TRI)
                        ? {
                            key: 'approve',
                            label: 'Phê duyệt',
                            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                            onClick: () => handlePheDuyet(record.id!),
                        } : null,

                    isDuyetOrThucHien && authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TIEN_DO_PSCBT)
                        ? {
                            key: 'progress',
                            label: 'Cập nhật tiến độ',
                            icon: <InfoCircleOutlined style={{ color: '#722ed1' }} />,
                            onClick: () => handleOpenProgressModal(record),
                        } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.XOA_PHIEU_SUA_CHUA_BAO_TRI)
                        ? {
                            key: 'delete',
                            label: (
                                <Popconfirm
                                    title="Xác nhận xóa"
                                    description="Xóa phiếu sửa chữa này?"
                                    onConfirm={() => handleXoa(record.id!)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                >
                                    <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa phiếu</span>
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
        <QuyenHanGuard quyenYeuCau={QUYEN.NHOM_PHIEU_SUA_CHUA}>
            <div style={{ padding: 24, minHeight: 'calc(100vh - 112px)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Chứng từ phiếu sửa chữa bảo trì</Title>
                        <Text type="secondary">Quản lý lập phiếu theo dõi gửi sửa chữa, bảo hành thiết bị thực tế.</Text>
                    </div>
                    <QuyenHanGuard quyenYeuCau={QUYEN.THEM_MOI_PHIEU_SUA_CHUA_BAO_TRI}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('add')}>
                            Lập phiếu sửa mới
                        </Button>
                    </QuyenHanGuard>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <Select
                                placeholder="Trạng thái chứng từ"
                                style={{ width: '100%' }}
                                value={trangThai}
                                onChange={setTrangThai}
                                allowClear
                                options={[
                                    { value: 'TAO_MOI', label: 'Tạo mới' },
                                    { value: 'GUI_PHE_DUYET', label: 'Chờ phê duyệt' },
                                    { value: 'DA_PHE_DUYET', label: 'Đã phê duyệt' },
                                    { value: 'DANG_THUC_HIEN', label: 'Đang thực hiện' },
                                    { value: 'HOAN_THANH', label: 'Đã hoàn thành' },
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

                <PhieuSuaChuaFormModal
                    open={isFormOpen}
                    loading={modalLoading}
                    selectedRecord={selectedItem}
                    mode={formMode}
                    onCancel={() => { setIsFormOpen(false); setSelectedItem(null); }}
                    onSave={handleSaveForm}
                />

                <Modal
                    title={`Cập nhật tiến độ thực hiện: ${selectedItem?.maPhieuSuaChua || ''}`}
                    open={isProgressModalOpen}
                    onOk={handleSaveProgress}
                    onCancel={() => setIsProgressModalOpen(false)}
                    confirmLoading={modalLoading}
                    width={900}
                >
                    <div style={{ maxHeight: '60vh', overflowY: 'auto', marginTop: 16 }}>
                        <Table
                            dataSource={progressItems}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            columns={[
                                {
                                    title: 'Tên mẫu tài sản',
                                    dataIndex: 'tenMauTaiSan',
                                    key: 'tenMauTaiSan',
                                },
                                {
                                    title: 'Loại',
                                    dataIndex: 'loai',
                                    key: 'loaiTaiSan',
                                    width: 100,
                                    render: (val) => val === 'THIET_BI' ? 'Thiết bị' : 'Linh kiện',
                                },
                                {
                                    title: 'Hình thức',
                                    dataIndex: 'loaiHinhXuLy',
                                    key: 'loaiHinhXuLy',
                                    width: 150,
                                    render: (val) => {
                                        if (val === 'GUI_BAO_HANH') return 'Bảo hành';
                                        if (val === 'SUA_CHUA_DICH_VU') return 'Sửa dịch vụ';
                                        return 'Thay thế';
                                    }
                                },
                                {
                                    title: 'Trạng thái cũ',
                                    dataIndex: 'trangThaiThucHien',
                                    key: 'trangThaiThucHien',
                                    width: 120,
                                    render: (val) => renderItemStatus(val),
                                },
                                {
                                    title: 'Trạng thái mới',
                                    key: 'trangThaiMoi',
                                    width: 150,
                                    render: (_, record) => (
                                        <Select
                                            value={progressFormValues[record.id!]?.trangThaiThucHienMoi}
                                            onChange={(val) => handleProgressValueChange(record.id!, 'trangThaiThucHienMoi', val)}
                                            style={{ width: '100%' }}
                                        >
                                            <Select.Option value="CHUA_GUI_DI">Chưa gửi đi</Select.Option>
                                            <Select.Option value="DA_GUI_DI">Đã gửi đi</Select.Option>
                                            <Select.Option value="DA_THU_LAI">Đã thu lại (Xong)</Select.Option>
                                        </Select>
                                    )
                                },
                                {
                                    title: 'Phương án xử lý',
                                    key: 'phuongAn',
                                    width: 180,
                                    render: (_, record) => (
                                        <Input
                                            value={progressFormValues[record.id!]?.phuongAnXuLy}
                                            onChange={(e) => handleProgressValueChange(record.id!, 'phuongAnXuLy', e.target.value)}
                                            placeholder="Ghi nhận xử lý..."
                                        />
                                    )
                                },
                                {
                                    title: 'Chi phí thực (VNĐ)',
                                    key: 'chiPhi',
                                    width: 130,
                                    render: (_, record) => (
                                        <InputNumber
                                            value={progressFormValues[record.id!]?.chiPhiThucTe}
                                            onChange={(val) => handleProgressValueChange(record.id!, 'chiPhiThucTe', val)}
                                            style={{ width: '100%' }}
                                            min={0}
                                        />
                                    )
                                }
                            ]}
                        />
                    </div>
                </Modal>
            </div>
        </QuyenHanGuard>
    );
});

export default PhieuSuaChuaPage;
