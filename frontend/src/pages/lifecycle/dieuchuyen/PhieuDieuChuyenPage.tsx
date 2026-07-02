import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select, DatePicker, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, CheckCircleOutlined, SendOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';

// Sử dụng đúng các hàm từ phieu-dieu-chuyen-tai-san-controller.ts
import {
    layDanhSach12,
    layTheoId12,
    themMoi12,
    capNhat12,
    xoaMem12,
    yeuCauPheDuyet3,
    pheDuyet3,
    tuChoiPheDuyet2,
    hoanThanh2
} from '../../../api-generated/endpoints/phieu-dieu-chuyen-tai-san-controller/phieu-dieu-chuyen-tai-san-controller';

// Các API phụ trợ
import { laySelectOptions6 as layNguoiDungOptions } from '../../../api-generated/endpoints/nguoi-dung-controller/nguoi-dung-controller';
import type { SelectOption } from '../../../api-generated/models/selectOption';
import { PhieuDieuChuyenFormModal } from './PhieuDieuChuyenFormModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const PhieuDieuChuyenPage: React.FC = observer(() => {
    const [loading, setLoading] = useState(false);
    const [danhSach, setDanhSach] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filters
    const [trangThai, setTrangThai] = useState<string | undefined>(undefined);
    const [idNguoiChuyen, setIdNguoiChuyen] = useState<number | undefined>(undefined);
    const [idNguoiNhan, setIdNguoiNhan] = useState<number | undefined>(undefined);
    const [dateRange, setDateRange] = useState<any>(null);
    const [nguoiDungOptions, setNguoiDungOptions] = useState<SelectOption[]>([]);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

    // Reject Modal state
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [lyDoTuChoi, setLyDoTuChoi] = useState('');

    useEffect(() => {
        layNguoiDungOptions().then(res => {
            if (res.data) setNguoiDungOptions(res.data);
        }).catch(() => { });
    }, []);

    const taiDuLieu = async (page: number, size: number) => {
        setLoading(true);
        try {
            const res = await layDanhSach12({
                page: page - 1,
                size,
                trangThai: trangThai || undefined,
                idNguoiChuyen: idNguoiChuyen || undefined,
                idNguoiNhan: idNguoiNhan || undefined,
                tuNgay: dateRange?.[0] ? dayjs(dateRange[0]).format('YYYY-MM-DD') : undefined,
                denNgay: dateRange?.[1] ? dayjs(dateRange[1]).format('YYYY-MM-DD') : undefined,
            });
            if (res.code === 200 && res.data) {
                const content = (res.data as any).content || [];
                const pageInfo = (res.data as any).page_info || {};
                setDanhSach(content);
                setTotalCount(pageInfo.total_elements || (res.data as any).totalElements || 0);
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể tải danh sách phiếu điều chuyển!');
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
        setIdNguoiChuyen(undefined);
        setIdNguoiNhan(undefined);
        setDateRange(null);
        setCurrentPage(1);
        taiDuLieu(1, pageSize);
    };

    const handleOpenModal = async (mode: 'add' | 'edit' | 'view', record?: any) => {
        setFormMode(mode);
        if (mode === 'add') {
            setSelectedItem(null);
            setIsFormOpen(true);
        } else if (record && record.id) {
            setLoading(true);
            try {
                const detailRes = await layTheoId12(record.id);
                if (detailRes.data) {
                    setSelectedItem(detailRes.data);
                    setIsFormOpen(true);
                }
            } catch (error) {
                message.error('Lỗi khi lấy chi tiết phiếu điều chuyển');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveForm = async (values: any) => {
        setModalLoading(true);
        try {
            if (selectedItem && selectedItem.id) {
                const res = await capNhat12(selectedItem.id, values);
                if (res.code === 200) {
                    message.success('Cập nhật phiếu thành công!');
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || 'Cập nhật thất bại!');
                }
            } else {
                const res = await themMoi12(values);
                if (res.code === 200) {
                    message.success('Tạo phiếu điều chuyển thành công!');
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || 'Thêm mới thất bại!');
                }
            }
        } catch (e: any) {
            message.error(e?.message || 'Có lỗi xảy ra khi lưu!');
        } finally {
            setModalLoading(false);
        }
    };

    const handleHanhDong = async (action: string, id: number) => {
        try {
            let res;
            if (action === 'delete') {
                res = await xoaMem12(id);
                if (res.code === 200) message.success('Xóa phiếu thành công!');
            } else if (action === 'yeuCauPheDuyet') {
                res = await yeuCauPheDuyet3(id);
                if (res.code === 200) message.success('Đã gửi yêu cầu phê duyệt!');
            } else if (action === 'pheDuyet') {
                res = await pheDuyet3(id);
                if (res.code === 200) message.success('Phê duyệt phiếu thành công!');
            } else if (action === 'hoanThanh') {
                res = await hoanThanh2(id);
                if (res.code === 200) message.success('Xác nhận hoàn thành điều chuyển thành công!');
            }
            if (res?.code === 200) taiDuLieu(currentPage, pageSize);
            else message.error(res?.message || 'Thao tác thất bại!');
        } catch (e: any) {
            message.error(e?.message || 'Lỗi kết nối tới máy chủ');
        }
    };

    const handleXacNhanTuChoi = async () => {
        if (!lyDoTuChoi.trim()) {
            message.warning('Vui lòng nhập lý do từ chối!');
            return;
        }
        try {
            const res = await tuChoiPheDuyet2(rejectId!, { lyDoTuChoi });
            if (res.code === 200) {
                message.success('Đã từ chối phê duyệt phiếu điều chuyển!');
                setIsRejectModalOpen(false);
                taiDuLieu(currentPage, pageSize);
            } else {
                message.error(res.message || 'Từ chối thất bại!');
            }
        } catch (e: any) {
            message.error(e?.message || 'Lỗi kết nối tới máy chủ');
        }
    };

    const renderStatus = (status: string) => {
        switch (status) {
            case 'TAO_MOI': return <Tag color="default">Tạo mới</Tag>;
            case 'GUI_PHE_DUYET': return <Tag color="warning">Chờ phê duyệt</Tag>;
            case 'DA_PHE_DUYET': return <Tag color="processing">Đã phê duyệt</Tag>;
            case 'HOAN_THANH': return <Tag color="success">Hoàn thành</Tag>;
            case 'TU_CHOI': return <Tag color="error">Từ chối</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: 'Mã phiếu',
            dataIndex: 'maPhieuDieuChuyen',
            key: 'maPhieuDieuChuyen',
            width: 130,
            sorter: (a: any, b: any) => (a.maPhieuDieuChuyen || '').localeCompare(b.maPhieuDieuChuyen || ''),
            defaultSortOrder: 'ascend' as const,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: 'Bên giao (Chuyển)',
            key: 'benGiao',
            render: (_: any, record: any) => (
                <div>
                    <div><Text strong>{record.tenNguoiChuyen}</Text></div>
                    <div><Text type="secondary" style={{ fontSize: '12px' }}>{record.tenPhongBanChuyen}</Text></div>
                </div>
            )
        },
        {
            title: 'Bên nhận (Đến)',
            key: 'benNhan',
            render: (_: any, record: any) => (
                <div>
                    <div><Text strong>{record.tenNguoiNhan}</Text></div>
                    <div><Text type="secondary" style={{ fontSize: '12px' }}>{record.tenPhongBanNhan}</Text></div>
                </div>
            )
        },
        {
            title: 'Người lập',
            dataIndex: 'tenNguoiLap',
            key: 'tenNguoiLap',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'thoiGianTao',
            key: 'thoiGianTao',
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trangThai',
            key: 'trangThai',
            width: 140,
            render: (val: string) => renderStatus(val),
        },
        {
            title: 'Hành động',
            key: 'hanhDong',
            width: 110,
            align: 'center' as const,
            render: (_: any, record: any) => {
                const items: MenuProps['items'] = [
                    authStore.kiemTraQuyen(QUYEN.XEM_PHIEU_DIEU_CHUYEN) ? {
                        key: 'view',
                        label: 'Xem chi tiết',
                        icon: <EyeOutlined />,
                        onClick: () => handleOpenModal('view', record),
                    } : null,

                    (record.trangThai === 'TAO_MOI' && authStore.kiemTraQuyen(QUYEN.SUA_PHIEU_DIEU_CHUYEN)) ? {
                        key: 'edit',
                        label: 'Chỉnh sửa phiếu',
                        icon: <EditOutlined />,
                        onClick: () => handleOpenModal('edit', record),
                    } : null,

                    (record.trangThai === 'TAO_MOI' && authStore.kiemTraQuyen(QUYEN.YEU_CAU_PHE_DUYET_DIEU_CHUYEN)) ? {
                        key: 'submit',
                        label: 'Gửi phê duyệt',
                        icon: <SendOutlined />,
                        onClick: () => handleHanhDong('yeuCauPheDuyet', record.id!),
                    } : null,

                    (record.trangThai === 'GUI_PHE_DUYET' && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_DIEU_CHUYEN)) ? {
                        key: 'approve',
                        label: 'Phê duyệt',
                        icon: <CheckCircleOutlined style={{ color: '#1890ff' }} />,
                        onClick: () => handleHanhDong('pheDuyet', record.id!),
                    } : null,

                    // Tài liệu ghi quyền "THAO_TAC_TAI_SAN" cho việc từ chối
                    (record.trangThai === 'GUI_PHE_DUYET' && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_DIEU_CHUYEN)) ? {
                        key: 'reject',
                        label: 'Từ chối phê duyệt',
                        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                        onClick: () => {
                            setRejectId(record.id!);
                            setLyDoTuChoi('');
                            setIsRejectModalOpen(true);
                        },
                    } : null,

                    (record.trangThai === 'DA_PHE_DUYET' && authStore.kiemTraQuyen(QUYEN.HOAN_THANH_DIEU_CHUYEN)) ? {
                        key: 'complete',
                        label: 'Hoàn thành điều chuyển',
                        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                        onClick: () => handleHanhDong('hoanThanh', record.id!),
                    } : null,

                    (record.trangThai === 'TAO_MOI' && authStore.kiemTraQuyen(QUYEN.XOA_PHIEU_DIEU_CHUYEN)) ? {
                        key: 'delete',
                        label: (
                            <Popconfirm title="Xác nhận xóa" description="Bạn có chắc chắn muốn xóa phiếu điều chuyển này?" onConfirm={() => handleHanhDong('delete', record.id!)} okText="Xóa" cancelText="Hủy">
                                <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa phiếu</span>
                            </Popconfirm>
                        ),
                        icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                    } : null,
                ].filter(Boolean) as MenuProps['items'];

                if (items.length === 0) return '-';

                return (
                    <Dropdown menu={{ items }} trigger={['click']}>
                        <Button size="small">Thao tác <DownOutlined /></Button>
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <QuyenHanGuard quyenYeuCau={QUYEN.XEM_PHIEU_DIEU_CHUYEN}>
            <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Phiếu điều chuyển tài sản</Title>
                        <Text type="secondary">Quản lý việc luân chuyển, bàn giao tài sản từ nhân sự/phòng ban này sang nhân sự/phòng ban khác.</Text>
                    </div>
                    <QuyenHanGuard quyenYeuCau={QUYEN.THEM_PHIEU_DIEU_CHUYEN}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('add')}>
                            Lập phiếu điều chuyển
                        </Button>
                    </QuyenHanGuard>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={5}>
                            <Select
                                placeholder="Trạng thái"
                                style={{ width: '100%' }}
                                value={trangThai}
                                onChange={setTrangThai}
                                allowClear
                                options={[
                                    { value: 'TAO_MOI', label: 'Tạo mới' },
                                    { value: 'GUI_PHE_DUYET', label: 'Chờ phê duyệt' },
                                    { value: 'DA_PHE_DUYET', label: 'Đã phê duyệt' },
                                    { value: 'HOAN_THANH', label: 'Hoàn thành' },
                                    { value: 'TU_CHOI', label: 'Từ chối' },
                                ]}
                            />
                        </Col>
                        <Col xs={24} md={5}>
                            <Select
                                placeholder="Lọc theo người chuyển"
                                style={{ width: '100%' }}
                                value={idNguoiChuyen}
                                onChange={setIdNguoiChuyen}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={nguoiDungOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                            />
                        </Col>
                        <Col xs={24} md={5}>
                            <Select
                                placeholder="Lọc theo người nhận"
                                style={{ width: '100%' }}
                                value={idNguoiNhan}
                                onChange={setIdNguoiNhan}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={nguoiDungOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                            />
                        </Col>
                        <Col xs={24} md={5}>
                            <RangePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                value={dateRange}
                                onChange={setDateRange}
                                placeholder={['Từ ngày lập', 'Đến ngày lập']}
                            />
                        </Col>
                        <Col xs={24} md={4}>
                            <Space>
                                <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>Tìm kiếm</Button>
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

                <PhieuDieuChuyenFormModal
                    open={isFormOpen}
                    loading={modalLoading}
                    selectedRecord={selectedItem}
                    mode={formMode}
                    onCancel={() => { setIsFormOpen(false); setSelectedItem(null); }}
                    onSave={handleSaveForm}
                />

                <Modal
                    title="Xác nhận từ chối phê duyệt"
                    open={isRejectModalOpen}
                    onCancel={() => setIsRejectModalOpen(false)}
                    onOk={handleXacNhanTuChoi}
                    okText="Xác nhận từ chối"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                >
                    <div style={{ marginBottom: 8 }}>Vui lòng nhập lý do từ chối điều chuyển (bắt buộc):</div>
                    <Input.TextArea
                        rows={3}
                        placeholder="Lý do..."
                        value={lyDoTuChoi}
                        onChange={(e) => setLyDoTuChoi(e.target.value)}
                    />
                </Modal>
            </div>
        </QuyenHanGuard>
    );
});

export default PhieuDieuChuyenPage;