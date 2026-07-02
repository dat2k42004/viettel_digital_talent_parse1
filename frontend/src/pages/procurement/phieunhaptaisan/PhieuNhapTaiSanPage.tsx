import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';

// TODO: Đổi tên hàm API cho khớp với tên Orval tự động sinh
import {
    layDanhSach10,
    layTheoId10,
    themMoi10,
    capNhat10,
    capNhatTrangThai7,
    xoaMem10
} from '../../../api-generated/endpoints/phieu-nhap-tai-san-controller/phieu-nhap-tai-san-controller';
import { laySelectOptions10 as layDonHangOptions } from '../../../api-generated/endpoints/don-hang-mua-sam-controller/don-hang-mua-sam-controller';
import type { PhieuNhapTaiSanResponse } from '../../../api-generated/models/phieuNhapTaiSanResponse';
import type { PhieuNhapTaiSanRequest } from '../../../api-generated/models/phieuNhapTaiSanRequest';
import type { SelectOption } from '../../../api-generated/models/selectOption';
import { PhieuNhapTaiSanFormModal } from './PhieuNhapTaiSanFormModal';

const { Title, Text } = Typography;

export const PhieuNhapTaiSanPage: React.FC = observer(() => {
    const [loading, setLoading] = useState(false);
    const [danhSach, setDanhSach] = useState<PhieuNhapTaiSanResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filters
    const [maPhieuNhap, setMaPhieuNhap] = useState('');
    const [soHoaDonVat, setSoHoaDonVat] = useState('');
    const [idDonHangMuaSam, setIdDonHangMuaSam] = useState<number | undefined>(undefined);
    const [trangThai, setTrangThai] = useState<string | undefined>(undefined);
    const [donHangOptions, setDonHangOptions] = useState<SelectOption[]>([]);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PhieuNhapTaiSanResponse | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

    useEffect(() => {
        layDonHangOptions().then(res => {
            if (res.data) setDonHangOptions(res.data);
        }).catch(() => { });
    }, []);

    const taiDuLieu = async (page: number, size: number) => {
        setLoading(true);
        try {
            const res = await layDanhSach10({
                page: page - 1,
                size,
                maPhieuNhap: maPhieuNhap || undefined,
                soHoaDonVat: soHoaDonVat || undefined,
                idDonHangMuaSam: idDonHangMuaSam || undefined,
                trangThai: trangThai || undefined,
            });
            if (res.code === 200 && res.data) {
                setDanhSach(res.data.content || []);
                setTotalCount(res.data.page_info?.total_elements || 0);
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể tải danh sách phiếu nhập!');
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
        setMaPhieuNhap('');
        setSoHoaDonVat('');
        setIdDonHangMuaSam(undefined);
        setTrangThai(undefined);
        setCurrentPage(1);
        taiDuLieu(1, pageSize);
    };

    const handleOpenModal = async (mode: 'add' | 'edit' | 'view', record?: PhieuNhapTaiSanResponse) => {
        setFormMode(mode);
        if (mode === 'add') {
            setSelectedItem(null);
            setIsFormOpen(true);
        } else if (record && record.id) {
            setLoading(true);
            try {
                const detailRes = await layTheoId10(record.id);
                if (detailRes.data) {
                    setSelectedItem(detailRes.data);
                    setIsFormOpen(true);
                }
            } catch (error) {
                message.error('Lỗi khi lấy chi tiết phiếu nhập');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveForm = async (values: PhieuNhapTaiSanRequest) => {
        setModalLoading(true);
        try {
            if (selectedItem && selectedItem.id) {
                const res = await capNhat10(selectedItem.id, values);
                if (res.code === 200) {
                    message.success('Cập nhật phiếu nhập thành công!');
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || 'Cập nhật thất bại!');
                }
            } else {
                const res = await themMoi10(values);
                if (res.code === 200) {
                    message.success('Tạo phiếu nhập tài sản thành công!');
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

    const handleChotNhapKho = async (id: number) => {
        try {
            const res = await capNhatTrangThai7(id, { trangThai: 'HOAN_THANH' });
            if (res.code === 200) {
                message.success('Chốt phiếu nhập kho thành công! Đã phát sinh tài sản.');
                taiDuLieu(currentPage, pageSize);
            } else {
                message.error(res.message || 'Chốt nhập kho thất bại!');
            }
        } catch (e: any) {
            message.error(e?.message || 'Lỗi khi kết nối tới máy chủ');
        }
    };

    const handleXoa = async (id: number) => {
        try {
            const res = await xoaMem10(id);
            if (res.code === 200) {
                message.success('Xóa phiếu nhập thành công!');
                taiDuLieu(currentPage, pageSize);
            } else {
                message.error(res.message || 'Xóa thất bại!');
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể xóa phiếu nhập!');
        }
    };

    const renderStatus = (status: string) => {
        switch (status) {
            case 'TAO_MOI': return <Tag color="cyan">Tạo mới</Tag>;
            case 'HOAN_THANH': return <Tag color="green">Đã nhập kho xong</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: 'Mã phiếu nhập',
            dataIndex: 'maPhieuNhap',
            key: 'maPhieuNhap',
            width: 140,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: 'Đơn hàng (PO)',
            dataIndex: 'maDonHangMuaSam',
            key: 'maDonHangMuaSam',
            width: 140,
        },
        {
            title: 'Hóa đơn VAT',
            dataIndex: 'soHoaDonVat',
            key: 'soHoaDonVat',
        },
        {
            title: 'Ngày nhập kho',
            dataIndex: 'thoiGianNhapKho',
            key: 'thoiGianNhapKho',
            width: 150,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-',
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'tenNguoiNhap',
            key: 'tenNguoiNhap',
            width: 160,
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
            render: (_: any, record: PhieuNhapTaiSanResponse) => {
                const isTaoMoi = record.trangThai === 'TAO_MOI'; // Chỉ cho sửa, xóa, chốt kho khi Tạo mới

                const items: MenuProps['items'] = [
                    authStore.kiemTraQuyen(QUYEN.XEM_PHIEU_NHAP_TAI_SAN) ? {
                        key: 'view',
                        label: 'Xem chi tiết',
                        icon: <EyeOutlined />,
                        onClick: () => handleOpenModal('view', record),
                    } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.SUA_PHIEU_NHAP_TAI_SAN) ? {
                        key: 'edit',
                        label: 'Chỉnh sửa phiếu',
                        icon: <EditOutlined />,
                        onClick: () => handleOpenModal('edit', record),
                    } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_PHIEU_NHAP_TAI_SAN) ? {
                        key: 'complete',
                        label: 'Hoàn thành nhập kho',
                        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                        onClick: () => handleChotNhapKho(record.id!),
                    } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.XOA_PHIEU_NHAP_TAI_SAN) ? {
                        key: 'delete',
                        label: (
                            <Popconfirm title="Xác nhận xóa" description="Hủy bỏ phiếu nhập này?" onConfirm={() => handleXoa(record.id!)} okText="Xóa" cancelText="Hủy">
                                <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa phiếu nhập</span>
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
        <QuyenHanGuard quyenYeuCau={QUYEN.XEM_PHIEU_NHAP_TAI_SAN}>
            <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Phiếu nhập kho tài sản</Title>
                        <Text type="secondary">Quản lý tiếp nhận vật tư, sinh mã thẻ tài sản thực tế và đối soát hóa đơn chứng từ.</Text>
                    </div>
                    <QuyenHanGuard quyenYeuCau={QUYEN.THEM_PHIEU_NHAP_TAI_SAN}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('add')}>
                            Lập phiếu nhập
                        </Button>
                    </QuyenHanGuard>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={6}>
                            <Input
                                placeholder="Mã phiếu nhập..."
                                value={maPhieuNhap}
                                onChange={(e) => setMaPhieuNhap(e.target.value)}
                                prefix={<SearchOutlined />}
                                onPressEnter={handleSearch}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <Input
                                placeholder="Số hóa đơn VAT..."
                                value={soHoaDonVat}
                                onChange={(e) => setSoHoaDonVat(e.target.value)}
                                onPressEnter={handleSearch}
                            />
                        </Col>
                        <Col xs={24} md={4}>
                            <Select
                                placeholder="Lọc theo đơn hàng"
                                style={{ width: '100%' }}
                                value={idDonHangMuaSam}
                                onChange={setIdDonHangMuaSam}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={donHangOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                            />
                        </Col>
                        <Col xs={24} md={4}>
                            <Select
                                placeholder="Trạng thái"
                                style={{ width: '100%' }}
                                value={trangThai}
                                onChange={setTrangThai}
                                allowClear
                                options={[
                                    { value: 'TAO_MOI', label: 'Tạo mới' },
                                    { value: 'HOAN_THANH', label: 'Đã nhập kho xong' },
                                ]}
                            />
                        </Col>
                        <Col xs={24} md={4}>
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

                <PhieuNhapTaiSanFormModal
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

export default PhieuNhapTaiSanPage;