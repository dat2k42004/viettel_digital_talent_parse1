import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select, DatePicker, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, CheckCircleOutlined, SendOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';

// Đã cập nhật chính xác 100% tên hàm từ file controller cậu cung cấp
import {
    layDanhSach7,
    layTheoId7,
    themMoi7,
    capNhat7,
    xoaMem7,
    yeuCauPheDuyet,
    pheDuyet,
    tuChoiPheDuyet,
    hoanThanh
} from '../../../api-generated/endpoints/phieu-thu-hoi-tai-san-controller/phieu-thu-hoi-tai-san-controller';

// Giả định file phòng ban option của cậu là 4 (hoặc cậu đổi lại theo file hiện tại)
import { laySelectOptions4 as layPhongBanOptions } from '../../../api-generated/endpoints/phong-ban-controller/phong-ban-controller';
import type { SelectOption } from '../../../api-generated/models/selectOption';
import { PhieuThuHoiFormModal } from './PhieuThuHoiFormModal';
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const PhieuThuHoiPage: React.FC = observer(() => {
    const [loading, setLoading] = useState(false);
    const [danhSach, setDanhSach] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filters
    const [trangThai, setTrangThai] = useState<string | undefined>(undefined);
    const [idPhongBan, setIdPhongBan] = useState<number | undefined>(undefined);
    const [dateRange, setDateRange] = useState<any>(null);
    const [phongBanOptions, setPhongBanOptions] = useState<SelectOption[]>([]);

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
        layPhongBanOptions().then(res => {
            if (res.data) setPhongBanOptions(res.data);
        }).catch(() => { });
    }, []);

    const taiDuLieu = async (page: number, size: number) => {
        setLoading(true);
        try {
            const res = await layDanhSach7({
                page: page - 1,
                size,
                trangThai: trangThai || undefined,
                idPhongBan: idPhongBan || undefined,
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
            message.error(e?.message || 'Không thể tải danh sách phiếu thu hồi!');
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
        setIdPhongBan(undefined);
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
                const detailRes = await layTheoId7(record.id);
                if (detailRes.data) {
                    setSelectedItem(detailRes.data);
                    setIsFormOpen(true);
                }
            } catch (error) {
                message.error('Lỗi khi lấy chi tiết phiếu thu hồi');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveForm = async (values: any) => {
        setModalLoading(true);
        try {
            if (selectedItem && selectedItem.id) {
                const res = await capNhat7(selectedItem.id, values);
                if (res.code === 200) {
                    message.success('Cập nhật phiếu thành công!');
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || 'Cập nhật thất bại!');
                }
            } else {
                const res = await themMoi7(values);
                if (res.code === 200) {
                    message.success('Tạo phiếu thu hồi thành công!');
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
                res = await xoaMem7(id);
                if (res.code === 200) message.success('Xóa phiếu thành công!');
            } else if (action === 'yeuCauPheDuyet') {
                res = await yeuCauPheDuyet(id);
                if (res.code === 200) message.success('Đã gửi yêu cầu phê duyệt!');
            } else if (action === 'pheDuyet') {
                res = await pheDuyet(id);
                if (res.code === 200) message.success('Phê duyệt phiếu thành công!');
            } else if (action === 'hoanThanh') {
                res = await hoanThanh(id);
                if (res.code === 200) message.success('Đã hoàn thành thu hồi tài sản!');
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
            // Dựa theo file của cậu: tuChoiPheDuyet(id: number, params: TuChoiPheDuyetParams)
            const res = await tuChoiPheDuyet(rejectId!, { lyDoTuChoi });
            if (res.code === 200) {
                message.success('Đã từ chối phê duyệt phiếu thu hồi!');
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
            dataIndex: 'maPhieuThuHoi',
            key: 'maPhieuThuHoi',
            width: 150,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: 'Người trả',
            dataIndex: 'tenNhanVienTra',
            key: 'tenNhanVienTra',
        },
        {
            title: 'Phòng ban trả',
            dataIndex: 'tenPhongBanTra',
            key: 'tenPhongBanTra',
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
            width: 150,
            render: (val: string) => renderStatus(val),
        },
        {
            title: 'Hành động',
            key: 'hanhDong',
            width: 110,
            align: 'center' as const,
            render: (_: any, record: any) => {
                const items: MenuProps['items'] = [
                    authStore.kiemTraQuyen(QUYEN.XEM_PHIEU_THU_HOI_TAI_SAN) ? {
                        key: 'view',
                        label: 'Xem chi tiết',
                        icon: <EyeOutlined />,
                        onClick: () => handleOpenModal('view', record),
                    } : null,

                    (record.trangThai === 'TAO_MOI' && authStore.kiemTraQuyen(QUYEN.SUA_PHIEU_THU_HOI_TAI_SAN)) ? {
                        key: 'edit',
                        label: 'Chỉnh sửa phiếu',
                        icon: <EditOutlined />,
                        onClick: () => handleOpenModal('edit', record),
                    } : null,

                    (record.trangThai === 'TAO_MOI' && authStore.kiemTraQuyen(QUYEN.YEU_CAU_PHE_DUYET_PHIEU_THU_HOI_TAI_SAN)) ? {
                        key: 'submit',
                        label: 'Gửi phê duyệt',
                        icon: <SendOutlined />,
                        onClick: () => handleHanhDong('yeuCauPheDuyet', record.id!),
                    } : null,

                    (record.trangThai === 'GUI_PHE_DUYET' && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_PHIEU_THU_HOI_TAI_SAN)) ? {
                        key: 'approve',
                        label: 'Phê duyệt',
                        icon: <CheckCircleOutlined style={{ color: '#1890ff' }} />,
                        onClick: () => handleHanhDong('pheDuyet', record.id!),
                    } : null,

                    (record.trangThai === 'GUI_PHE_DUYET' && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_PHIEU_THU_HOI_TAI_SAN)) ? {
                        key: 'reject',
                        label: 'Từ chối phê duyệt',
                        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                        onClick: () => {
                            setRejectId(record.id!);
                            setLyDoTuChoi('');
                            setIsRejectModalOpen(true);
                        },
                    } : null,

                    (record.trangThai === 'DA_PHE_DUYET' && authStore.kiemTraQuyen(QUYEN.HOAN_THANH_PHIEU_THU_HOI_TAI_SAN)) ? {
                        key: 'complete',
                        label: 'Hoàn thành thu hồi',
                        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                        onClick: () => handleHanhDong('hoanThanh', record.id!),
                    } : null,

                    (record.trangThai === 'TAO_MOI' && authStore.kiemTraQuyen(QUYEN.XOA_PHIEU_THU_HOI_TAI_SAN)) ? {
                        key: 'delete',
                        label: (
                            <Popconfirm title="Xác nhận xóa" description="Bạn có chắc chắn muốn xóa phiếu thu hồi này?" onConfirm={() => handleHanhDong('delete', record.id!)} okText="Xóa" cancelText="Hủy">
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
        <QuyenHanGuard quyenYeuCau={QUYEN.XEM_PHIEU_THU_HOI_TAI_SAN}>
            <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Phiếu thu hồi tài sản</Title>
                        <Text type="secondary">Quản lý và thực hiện thu hồi tài sản (thiết bị, phần mềm, linh kiện) từ nhân viên.</Text>
                    </div>
                    <QuyenHanGuard quyenYeuCau={QUYEN.THEM_PHIEU_THU_HOI_TAI_SAN}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('add')}>
                            Lập phiếu thu hồi
                        </Button>
                    </QuyenHanGuard>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={6}>
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
                        <Col xs={24} md={6}>
                            <Select
                                placeholder="Lọc theo phòng ban trả"
                                style={{ width: '100%' }}
                                value={idPhongBan}
                                onChange={setIdPhongBan}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={phongBanOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <RangePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                value={dateRange}
                                onChange={setDateRange}
                                placeholder={['Từ ngày lập', 'Đến ngày lập']}
                            />
                        </Col>
                        <Col xs={24} md={6}>
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

                <PhieuThuHoiFormModal
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
                    <div style={{ marginBottom: 8 }}>Vui lòng nhập lý do từ chối (bắt buộc):</div>
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

export default PhieuThuHoiPage;