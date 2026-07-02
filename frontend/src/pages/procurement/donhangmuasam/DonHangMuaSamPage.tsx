import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import {
    layDanhSach22, // TODO: Trỏ lại hàm Orval sinh ra
    layTheoId22,
    themMoi22,
    capNhat21,
    yeuCauPheDuyet7,
    pheDuyet7,
    xoaMem22
} from '../../../api-generated/endpoints/don-hang-mua-sam-controller/don-hang-mua-sam-controller';
import { laySelectOptions5 as layNccOptions } from '../../../api-generated/endpoints/nha-cung-cap-controller/nha-cung-cap-controller';
import type { DonHangMuaSamResponse } from '../../../api-generated/models/donHangMuaSamResponse';
import type { DonHangMuaSamRequest } from '../../../api-generated/models/donHangMuaSamRequest';
import type { SelectOption } from '../../../api-generated/models/selectOption';
import { DonHangMuaSamFormModal } from './DonHangMuaSamFormModal';

const { Title, Text } = Typography;

export const DonHangMuaSamPage: React.FC = observer(() => {
    const [loading, setLoading] = useState(false);
    const [danhSach, setDanhSach] = useState<DonHangMuaSamResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filters
    const [maDonHang, setMaDonHang] = useState('');
    const [idNhaCungCap, setIdNhaCungCap] = useState<number | undefined>(undefined);
    const [trangThai, setTrangThai] = useState<string | undefined>(undefined);
    const [nccOptions, setNccOptions] = useState<SelectOption[]>([]);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DonHangMuaSamResponse | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

    const fetchNccOptions = async () => {
        try {
            const res = await layNccOptions();
            if (res.data) setNccOptions(res.data);
        } catch (error) { }
    };

    const taiDuLieu = async (page: number, size: number) => {
        setLoading(true);
        try {
            const res = await layDanhSach22({
                page: page - 1,
                size,
                maDonHang: maDonHang || undefined,
                idNhaCungCap: idNhaCungCap || undefined,
                trangThai: trangThai || undefined,
            });
            if (res.code === 200 && res.data) {
                setDanhSach(res.data.content || []);
                setTotalCount(res.data.page_info?.total_elements || 0);
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể tải danh sách đơn hàng!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNccOptions();
    }, []);

    useEffect(() => {
        taiDuLieu(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const handleSearch = () => {
        setCurrentPage(1);
        taiDuLieu(1, pageSize);
    };

    const handleReset = () => {
        setMaDonHang('');
        setIdNhaCungCap(undefined);
        setTrangThai(undefined);
        setCurrentPage(1);
        setLoading(true);
        layDanhSach22({ page: 0, size: pageSize })
            .then((res) => {
                if (res.code === 200 && res.data) {
                    setDanhSach(res.data.content || []);
                    setTotalCount(res.data.page_info?.total_elements || 0);
                }
            })
            .catch(() => message.error('Không thể tải lại danh sách!'))
            .finally(() => setLoading(false));
    };

    const handleOpenModal = async (mode: 'add' | 'edit' | 'view', record?: DonHangMuaSamResponse) => {
        setFormMode(mode);
        if (mode === 'add') {
            setSelectedItem(null);
            setIsFormOpen(true);
        } else if (record && record.id) {
            // Phải lấy detail để có chiTietTaiSan
            setLoading(true);
            try {
                const detailRes = await layTheoId22(record.id);
                if (detailRes.data) {
                    setSelectedItem(detailRes.data);
                    setIsFormOpen(true);
                }
            } catch (error) {
                message.error('Lỗi khi lấy chi tiết đơn hàng');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveForm = async (values: DonHangMuaSamRequest) => {
        setModalLoading(true);
        try {
            if (selectedItem && selectedItem.id) {
                const res = await capNhat21(selectedItem.id, values);
                if (res.code === 200) {
                    message.success('Cập nhật đơn hàng thành công!');
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || 'Cập nhật thất bại!');
                }
            } else {
                const res = await themMoi22(values);
                if (res.code === 200) {
                    message.success('Tạo đơn hàng mua sắm thành công!');
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
            const res = await yeuCauPheDuyet7(id);
            if (res.code === 200) {
                message.success('Đã gửi yêu cầu phê duyệt đơn hàng!');
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || 'Lỗi khi gửi phê duyệt');
        }
    };

    const handlePheDuyet = async (id: number) => {
        try {
            const res = await pheDuyet7(id);
            if (res.code === 200) {
                message.success('Phê duyệt đơn hàng thành công!');
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || 'Lỗi khi phê duyệt');
        }
    };

    const handleXoa = async (id: number) => {
        try {
            const res = await xoaMem22(id);
            if (res.code === 200) {
                message.success('Xóa đơn hàng thành công!');
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể xóa đơn hàng!');
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
            case 'HOAN_THANH':
                return <Tag color="green">Đã hoàn thành</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: 'Mã PO',
            dataIndex: 'maDonHang',
            key: 'maDonHang',
            width: 150,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'tenNhaCungCap',
            key: 'tenNhaCungCap',
        },
        {
            title: 'Ngày giao DK',
            dataIndex: 'thoiGianGiaoDuKien',
            key: 'thoiGianGiaoDuKien',
            width: 120,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Tổng tiền (VNĐ)',
            dataIndex: 'tongTienSauThue',
            key: 'tongTienSauThue',
            width: 150,
            render: (val: number) => val ? val.toLocaleString('vi-VN') : '0',
        },
        {
            title: 'Người lập',
            dataIndex: 'tenNguoiLap',
            key: 'tenNguoiLap',
            width: 160,
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
            width: 120,
            render: (_: any, record: DonHangMuaSamResponse) => {
                const isTaoMoi = record.trangThai === 'TAO_MOI';
                const isChoDuyet = record.trangThai === 'GUI_PHE_DUYET';

                const items: MenuProps['items'] = [
                    authStore.kiemTraQuyen(QUYEN.XEM_DON_HANG_MUA_SAM)
                        ? {
                            key: 'view',
                            label: 'Xem chi tiết',
                            icon: <EyeOutlined />,
                            onClick: () => handleOpenModal('view', record),
                        } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.SUA_DON_HANG_MUA_SAM)
                        ? {
                            key: 'edit',
                            label: 'Chỉnh sửa đơn',
                            icon: <EditOutlined />,
                            onClick: () => handleOpenModal('edit', record),
                        } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.YEU_CAU_PHE_DUYET_DON_HANG_MUA_SAM)
                        ? {
                            key: 'request_approval',
                            label: 'Gửi phê duyệt',
                            icon: <SendOutlined />,
                            onClick: () => handleYeuCauPheDuyet(record.id!),
                        } : null,

                    isChoDuyet && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_DON_HANG_MUA_SAM)
                        ? {
                            key: 'approve',
                            label: 'Phê duyệt đơn',
                            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                            onClick: () => handlePheDuyet(record.id!),
                        } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.XOA_DON_HANG_MUA_SAM)
                        ? {
                            key: 'delete',
                            label: (
                                <Popconfirm
                                    title="Xác nhận xóa"
                                    description="Xóa đơn hàng này?"
                                    onConfirm={() => handleXoa(record.id!)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                >
                                    <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa đơn hàng</span>
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
        <QuyenHanGuard quyenYeuCau={QUYEN.XEM_DON_HANG_MUA_SAM}>
            <div style={{ padding: 24, minHeight: 'calc(100vh - 112px)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Đơn hàng mua sắm (PO)</Title>
                        <Text type="secondary">Quản lý lập kế hoạch, mua sắm vật tư, trang thiết bị và bản quyền phần mềm.</Text>
                    </div>
                    <QuyenHanGuard quyenYeuCau={QUYEN.THEM_DON_HANG_MUA_SAM}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('add')}>
                            Lập đơn hàng mới
                        </Button>
                    </QuyenHanGuard>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={6}>
                            <Input
                                placeholder="Mã đơn hàng (PO)..."
                                value={maDonHang}
                                onChange={(e) => setMaDonHang(e.target.value)}
                                prefix={<SearchOutlined />}
                                onPressEnter={handleSearch}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <Select
                                placeholder="Lọc theo nhà cung cấp"
                                style={{ width: '100%' }}
                                value={idNhaCungCap}
                                onChange={setIdNhaCungCap}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={nccOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <Select
                                placeholder="Trạng thái đơn hàng"
                                style={{ width: '100%' }}
                                value={trangThai}
                                onChange={setTrangThai}
                                allowClear
                                options={[
                                    { value: 'TAO_MOI', label: 'Tạo mới' },
                                    { value: 'GUI_PHE_DUYET', label: 'Chờ phê duyệt' },
                                    { value: 'DA_PHE_DUYET', label: 'Đã phê duyệt' },
                                    { value: 'HOAN_THANH', label: 'Đã hoàn thành' },
                                ]}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <Space>
                                <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
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

                <DonHangMuaSamFormModal
                    open={isFormOpen}
                    loading={modalLoading}
                    selectedRecord={selectedItem}
                    mode={formMode}
                    onCancel={() => { setIsFormOpen(false); setSelectedItem(null); }}
                    onSave={handleSaveForm}
                />
            </div>
        </QuyenHanGuard>
    );
});

export default DonHangMuaSamPage;