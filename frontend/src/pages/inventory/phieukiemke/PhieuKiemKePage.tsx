import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select, DatePicker, Progress, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, CheckCircleOutlined, AuditOutlined, LineChartOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import {
    layDanhSach11 as layDanhSach,
    layTheoId11 as layTheoId,
    themMoi11 as themMoi,
    capNhat11 as capNhat,
    xoaMem11 as xoaMem,
    thucHienKiemKe,
    xacNhanHoanThanhPhongBan,
    theoDoiTienDoThucHien
} from '../../../api-generated/endpoints/phieu-kiem-ke-controller/phieu-kiem-ke-controller';
import { laySelectOptions4 as layPhongBanOptions } from '../../../api-generated/endpoints/phong-ban-controller/phong-ban-controller';
import type { PhieuKiemKeResponse } from '../../../api-generated/models/phieuKiemKeResponse';
import type { PhieuKiemKeRequest } from '../../../api-generated/models/phieuKiemKeRequest';
import type { TienDoPhongBanResponse } from '../../../api-generated/models/tienDoPhongBanResponse';
import type { ExecuteKiemKeRequest } from '../../../api-generated/models/executeKiemKeRequest';
import type { SelectOption } from '../../../api-generated/models/selectOption';
import { PhieuKiemKeFormModal } from './PhieuKiemKeFormModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const PhieuKiemKePage: React.FC = observer(() => {
    const [loading, setLoading] = useState(false);
    const [danhSach, setDanhSach] = useState<PhieuKiemKeResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filters
    const [trangThai, setTrangThai] = useState<string | undefined>(undefined);
    const [idPhongBan, setIdPhongBan] = useState<number | undefined>(() => authStore.currentUserProfile?.idPhongBan || undefined);
    const [dateRange, setDateRange] = useState<any>(null);

    // Dropdown list for rooms
    const [phongBanList, setPhongBanList] = useState<SelectOption[]>([]);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PhieuKiemKeResponse | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit' | 'view' | 'execute'>('add');

    // Progress Modal State
    const [isTienDoModalOpen, setIsTienDoModalOpen] = useState(false);
    const [tienDoList, setTienDoList] = useState<TienDoPhongBanResponse[]>([]);
    const [tienDoLoading, setTienDoLoading] = useState(false);

    const [selectedPhieu, setSelectedPhieu] = useState<PhieuKiemKeResponse | null>(null);

    const handleOpenTienDo = async (record: PhieuKiemKeResponse) => {
        setSelectedPhieu(record);
        setIsTienDoModalOpen(true);
        setTienDoLoading(true);
        try {
            const res = await theoDoiTienDoThucHien(record.dotKiemKeId!);
            if (res.code === 200 && res.data) {
                const filtered = res.data.filter(x => x.idPhieuKiemKe === record.id);
                setTienDoList(filtered);
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể tải tiến độ thực hiện!');
        } finally {
            setTienDoLoading(false);
        }
    };

    useEffect(() => {
        layPhongBanOptions().then(res => {
            if (res.data) setPhongBanList(res.data);
        }).catch(() => { });
    }, []);

    const taiDuLieu = async (page: number, size: number) => {
        setLoading(true);
        try {
            const res = await layDanhSach({
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
                setTotalCount(pageInfo.total_elements || 0);
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể tải danh sách phiếu kiểm kê!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        taiDuLieu(currentPage, pageSize);
    }, [currentPage, pageSize, trangThai, idPhongBan]);

    const handleSearch = () => {
        setCurrentPage(1);
        taiDuLieu(1, pageSize);
    };

    const handleReset = () => {
        setTrangThai(undefined);
        setIdPhongBan(authStore.currentUserProfile?.idPhongBan || undefined);
        setDateRange(null);
        setCurrentPage(1);
        taiDuLieu(1, pageSize);
    };

    const handleOpenModal = async (mode: 'add' | 'edit' | 'view' | 'execute', record?: PhieuKiemKeResponse) => {
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
                message.error('Lỗi khi lấy chi tiết phiếu kiểm kê');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveBasic = async (values: PhieuKiemKeRequest) => {
        setModalLoading(true);
        try {
            if (selectedItem && selectedItem.id) {
                const res = await capNhat(selectedItem.id, values);
                if (res.code === 200) {
                    message.success('Cập nhật phiếu kiểm kê thành công!');
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || 'Cập nhật thất bại!');
                }
            } else {
                const res = await themMoi(values);
                if (res.code === 200) {
                    message.success('Tạo phiếu kiểm kê thành công!');
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || 'Thêm mới thất bại!');
                }
            }
        } catch (e: any) {
            message.error(e?.message || 'Có lỗi xảy ra khi lưu phiếu kiểm kê!');
        } finally {
            setModalLoading(false);
        }
    };

    const handleSaveExecute = async (values: ExecuteKiemKeRequest) => {
        if (!selectedItem || !selectedItem.id) return;
        setModalLoading(true);
        try {
            const res = await thucHienKiemKe(selectedItem.id, values);
            if (res.code === 200) {
                message.success(values.isSubmit ? 'Đã gửi báo cáo đối soát kiểm kê thành công!' : 'Đã lưu nháp tiến độ kiểm kê thành công!');
                setIsFormOpen(false);
                taiDuLieu(currentPage, pageSize);
            } else {
                message.error(res.message || 'Thực hiện kiểm kê thất bại!');
            }
        } catch (e: any) {
            message.error(e?.message || 'Có lỗi xảy ra khi thực hiện kiểm kê!');
        } finally {
            setModalLoading(false);
        }
    };

    const handleXacNhanHoanThanh = async (id: number) => {
        try {
            const res = await xacNhanHoanThanhPhongBan(id);
            if (res.code === 200) {
                message.success('Đã phê duyệt nghiệm thu kết quả kiểm kê phòng ban!');
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || 'Lỗi khi phê duyệt nghiệm thu');
        }
    };

    const handleXoa = async (id: number) => {
        try {
            const res = await xoaMem(id);
            if (res.code === 200) {
                message.success('Xóa phiếu kiểm kê thành công!');
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể xóa phiếu kiểm kê!');
        }
    };

    const renderStatus = (status?: string) => {
        switch (status) {
            case 'TAO_MOI': return <Tag color="cyan">Tạo mới</Tag>;
            case 'DANG_THUC_HIEN': return <Tag color="purple">Đang thực hiện</Tag>;
            case 'DA_GUI': return <Tag color="orange">Chờ xác nhận</Tag>;
            case 'XAC_NHAN': return <Tag color="green">Đã nghiệm thu</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: 'Mã phiếu',
            dataIndex: 'maPhieuKiemKe',
            key: 'maPhieuKiemKe',
            width: 155,
            sorter: (a: PhieuKiemKeResponse, b: PhieuKiemKeResponse) => (a.maPhieuKiemKe || '').localeCompare(b.maPhieuKiemKe || ''),
            defaultSortOrder: 'ascend' as const,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: 'Mã đợt',
            dataIndex: 'maDotKiemKe',
            key: 'maDotKiemKe',
            width: 140,
        },
        {
            title: 'Tên đợt kiểm kê',
            dataIndex: 'tenDotKiemKe',
            key: 'tenDotKiemKe',
        },
        {
            title: 'Phòng ban',
            dataIndex: 'tenPhongBan',
            key: 'tenPhongBan',
        },
        {
            title: 'Nhân viên kiểm kê',
            dataIndex: 'tenNhanVienKiemKe',
            key: 'tenNhanVienKiemKe',
            width: 160,
        },
        {
            title: 'Thời gian thực hiện',
            dataIndex: 'thoiGianThucHien',
            key: 'thoiGianThucHien',
            width: 160,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-',
        },
        {
            title: 'Thời gian tạo',
            dataIndex: 'thoiGianTao',
            key: 'thoiGianTao',
            width: 130,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
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
            key: 'actions',
            width: 120,
            fixed: 'right' as const,
            render: (_: any, record: PhieuKiemKeResponse) => {
                const canEdit = authStore.kiemTraQuyen(QUYEN.CAP_NHAT_PHIEU_KIEM_KE) && record.trangThai === 'TAO_MOI' && record.idPhongBanKiemKe === idPhongBan;
                const canDelete = authStore.kiemTraQuyen(QUYEN.XOA_PHIEU_KIEM_KE) && record.trangThai === 'TAO_MOI' && record.idPhongBanKiemKe === idPhongBan;
                const canExecute = authStore.kiemTraQuyen(QUYEN.THUC_HIEN_KIEM_KE_TAI_SAN) && (record.trangThai === 'TAO_MOI' || record.trangThai === 'DANG_THUC_HIEN');
                const canVerify = authStore.kiemTraQuyen(QUYEN.XAC_NHAN_KET_QUA_KIEM_KE_PHONG_BAN) && record.trangThai === 'DA_GUI';
                const canViewProgress = authStore.kiemTraQuyen(QUYEN.XEM_TIEN_DO_KIEM_KE_DON_VI);

                const items: MenuProps['items'] = [
                    {
                        key: 'view',
                        label: 'Xem chi tiết',
                        icon: <EyeOutlined />,
                        onClick: () => handleOpenModal('view', record),
                    },
                    canViewProgress && record.dotKiemKeId ? {
                        key: 'progress',
                        label: 'Theo dõi tiến độ',
                        icon: <LineChartOutlined />,
                        onClick: () => handleOpenTienDo(record),
                    } : null,
                    canEdit ? {
                        key: 'edit',
                        label: 'Sửa thông tin',
                        icon: <EditOutlined />,
                        onClick: () => handleOpenModal('edit', record),
                    } : null,
                    canExecute ? {
                        key: 'execute',
                        label: 'Thực hiện đối soát',
                        icon: <AuditOutlined />,
                        onClick: () => handleOpenModal('execute', record),
                    } : null,
                    canVerify ? {
                        key: 'verify',
                        label: 'Phê duyệt nghiệm thu',
                        icon: <CheckCircleOutlined />,
                        onClick: () => handleXacNhanHoanThanh(record.id!),
                    } : null,
                    canDelete ? {
                        type: 'divider',
                    } : null,
                    canDelete ? {
                        key: 'delete',
                        label: (
                            <Popconfirm
                                title="Bạn chắc chắn muốn xóa phiếu kiểm kê này?"
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
                    <Title level={3} style={{ margin: 0 }}>Quản lý Phiếu kiểm kê phòng ban</Title>
                    <Text type="secondary">Thực hiện đối soát, kiểm kê tài sản thực tế và theo dõi tiến độ nghiệm thu phòng ban</Text>
                </div>
                <QuyenHanGuard quyenYeuCau={QUYEN.THEM_MOI_PHIEU_KIEM_KE}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('add')}>
                        Lập phiếu kiểm kê mới
                    </Button>
                </QuyenHanGuard>
            </div>

            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>Trạng thái phiếu</div>
                        <Select
                            placeholder="Tất cả trạng thái"
                            style={{ width: '100%' }}
                            allowClear
                            value={trangThai}
                            onChange={setTrangThai}
                        >
                            <Select.Option value="TAO_MOI">Tạo mới</Select.Option>
                            <Select.Option value="DANG_THUC_HIEN">Đang thực hiện</Select.Option>
                            <Select.Option value="DA_GUI">Chờ xác nhận</Select.Option>
                            <Select.Option value="XAC_NHAN">Đã nghiệm thu</Select.Option>
                        </Select>
                    </Col>
                    {!authStore.currentUserProfile?.idPhongBan && (
                        <Col xs={24} sm={8} md={6}>
                            <div style={{ fontWeight: 500, marginBottom: 4 }}>Phòng ban</div>
                            <Select
                                placeholder="Tất cả phòng ban"
                                style={{ width: '100%' }}
                                allowClear
                                value={idPhongBan}
                                onChange={setIdPhongBan}
                                showSearch
                                optionFilterProp="label"
                            >
                                {phongBanList.map(pb => (
                                    <Select.Option key={pb.id} value={pb.id} label={pb.ten}>{pb.ten}</Select.Option>
                                ))}
                            </Select>
                        </Col>
                    )}
                    <Col xs={24} sm={8} md={6}>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>Thời gian thực hiện</div>
                        <RangePicker
                            style={{ width: '100%' }}
                            value={dateRange}
                            onChange={setDateRange}
                            placeholder={['Từ ngày', 'Đến ngày']}
                            format="DD/MM/YYYY"
                        />
                    </Col>
                    <Col xs={24} sm={24} md={6} style={{ display: 'flex', alignItems: 'flex-end', paddingTop: 24 }}>
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

            <PhieuKiemKeFormModal
                open={isFormOpen}
                onCancel={() => setIsFormOpen(false)}
                selectedRecord={selectedItem}
                mode={formMode}
                onSaveBasic={handleSaveBasic}
                onSaveExecute={handleSaveExecute}
                loading={modalLoading}
            />

            <Modal
                title={`Theo dõi tiến độ kiểm kê phiếu: ${selectedPhieu?.maPhieuKiemKe || ''}`}
                open={isTienDoModalOpen}
                onCancel={() => setIsTienDoModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsTienDoModalOpen(false)}>Đóng</Button>
                ]}
                width={800}
            >
                <Table
                    loading={tienDoLoading}
                    dataSource={tienDoList}
                    rowKey="idPhongBan"
                    pagination={false}
                    columns={[
                        {
                            title: 'Phòng ban',
                            dataIndex: 'tenPhongBan',
                            key: 'tenPhongBan',
                        },
                        {
                            title: 'Trạng thái phiếu',
                            dataIndex: 'trangThaiPhieu',
                            key: 'trangThaiPhieu',
                            render: (val: string) => {
                                switch (val) {
                                    case 'TAO_MOI': return <Tag color="cyan">Tạo mới</Tag>;
                                    case 'DANG_THUC_HIEN': return <Tag color="purple">Đang thực hiện</Tag>;
                                    case 'DA_GUI': return <Tag color="orange">Chờ xác nhận</Tag>;
                                    case 'XAC_NHAN': return <Tag color="green">Đã nghiệm thu</Tag>;
                                    default: return <Tag color="default">{val || 'Chưa lập phiếu'}</Tag>;
                                }
                            }
                        },
                        {
                            title: 'Đã kiểm / Tổng số tài sản',
                            key: 'soLuong',
                            render: (_, row) => `${row.soLuongDaKiem ?? 0} / ${row.tongSoLuongTaiSan ?? 0}`,
                        },
                        {
                            title: 'Tiến độ',
                            key: 'progress',
                            width: 250,
                            render: (_, row) => {
                                const total = row.tongSoLuongTaiSan || 0;
                                const checked = row.soLuongDaKiem || 0;
                                const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
                                return <Progress percent={percent} size="small" status={percent === 100 ? "success" : "active"} />;
                            }
                        }
                    ]}
                />
            </Modal>
        </div>
    );
});

export default PhieuKiemKePage;
