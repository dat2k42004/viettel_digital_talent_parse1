import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
            message.error(e?.message || t('phieuSuaChuaPage.khong_the_tai_danh'));
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
                message.error(t('phieuSuaChuaPage.loi_khi_lay_chi'));
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
                    message.success(t('phieuSuaChuaPage.cap_nhat_phieu_thanh'));
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
                }
            } else {
                const res = await themMoi(values);
                if (res.code === 200) {
                    message.success(t('phieuSuaChuaPage.tao_phieu_sua_chua'));
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || t('viTriManagementPage.them_moi_that_bai'));
                }
            }
        } catch (e: any) {
            message.error(e?.message || t('danhMucCauHinhPage.co_loi_xay_ra'));
        } finally {
            setModalLoading(false);
        }
    };

    const handleYeuCauPheDuyet = async (id: number) => {
        try {
            const res = await yeuCauPheDuyet(id);
            if (res.code === 200) {
                message.success(t('phieuSuaChuaPage.da_gui_yeu_cau'));
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || t('donHangMuaSamPage.loi_khi_gui_phe'));
        }
    };

    const handlePheDuyet = async (id: number) => {
        try {
            const res = await pheDuyet(id);
            if (res.code === 200) {
                message.success(t('phieuSuaChuaPage.phe_duyet_phieu_sua'));
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || t('donHangMuaSamPage.loi_khi_phe_duyet'));
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
            message.error(t('phieuSuaChuaPage.loi_khi_tai_chi'));
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
                message.success(t('phieuSuaChuaPage.cap_nhat_tien_do_thuc'));
                setIsProgressModalOpen(false);
                taiDuLieu(currentPage, pageSize);
            } else {
                message.error(res.message || t('phieuSuaChuaPage.cap_nhat_tien_do_that_bai'));
            }
        } catch (e: any) {
            message.error(e?.message || t('phieuSuaChuaPage.loi_khi_cap_nhat'));
        } finally {
            setModalLoading(false);
        }
    };

    const handleXoa = async (id: number) => {
        try {
            const res = await xoaMem(id);
            if (res.code === 200) {
                message.success(t('phieuSuaChuaPage.xoa_phieu_sua_chua_thanh_cong'));
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || t('phieuSuaChuaPage.khong_the_xoa_phieu'));
        }
    };

    const renderStatus = (status: string) => {
        switch (status) {
            case 'TAO_MOI':
                return <Tag color="cyan">{t('phieuNhapTaiSanPage.tao_moi')}</Tag>;
            case 'GUI_PHE_DUYET':
                return <Tag color="orange">{t('donHangMuaSamPage.cho_phe_duyet')}</Tag>;
            case 'DA_PHE_DUYET':
                return <Tag color="blue">{t('donHangMuaSamPage.da_phe_duyet')}</Tag>;
            case 'DANG_THUC_HIEN':
                return <Tag color="purple">{t('phieuSuaChuaPage.dang_thuc_hien')}</Tag>;
            case 'HOAN_THANH':
                return <Tag color="green">{t('phieuSuaChuaPage.hoan_thanh')}</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const renderItemStatus = (status: string) => {
        switch (status) {
            case 'CHUA_GUI_DI': return <Tag color="default">{t('phieuSuaChuaPage.chua_gui_di')}</Tag>;
            case 'DA_GUI_DI': return <Tag color="warning">{t('phieuSuaChuaPage.da_gui_di_sua')}</Tag>;
            case 'DA_THU_LAI': return <Tag color="success">{t('phieuSuaChuaPage.da_thu_hoi_xu')}</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: t('phieuSuaChuaPage.ma_phieu'),
            dataIndex: 'maPhieuSuaChua',
            key: 'maPhieuSuaChua',
            width: 160,
            sorter: (a: PhieuSuaChuaBaoTriResponse, b: PhieuSuaChuaBaoTriResponse) => (a.maPhieuSuaChua || '').localeCompare(b.maPhieuSuaChua || ''),
            defaultSortOrder: 'ascend' as const,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: t('phieuSuaChuaPage.ma_ke_hoach_lien'),
            dataIndex: 'maKeHoachBaoTri',
            key: 'maKeHoachBaoTri',
            width: 160,
            render: (val: string) => val,
        },
        {
            title: t('phieuSuaChuaPage.ngay_bat_dau'),
            dataIndex: 'thoiGianBatDau',
            key: 'thoiGianBatDau',
            width: 120,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: t('phieuSuaChuaPage.hoan_thanh_dk'),
            dataIndex: 'thoiGianHoanThanhDuKien',
            key: 'thoiGianHoanThanhDuKien',
            width: 130,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: t('phieuSuaChuaPage.hoan_thanh_tt'),
            dataIndex: 'thoiGianHoanThanhThucTe',
            key: 'thoiGianHoanThanhThucTe',
            width: 130,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: t('phieuSuaChuaPage.tong_chi_phi_vnd'),
            dataIndex: 'tongChiPhiThucHien',
            key: 'tongChiPhiThucHien',
            width: 150,
            render: (val: number) => val ? val.toLocaleString('vi-VN') : '0',
        },
        {
            title: t('donHangMuaSamPage.nguoi_lap'),
            dataIndex: 'tenNguoiLap',
            key: 'tenNguoiLap',
            width: 140,
        },
        {
            title: t('loaiTaiSanFormModal.trang_thai'),
            dataIndex: 'trangThai',
            key: 'trangThai',
            width: 130,
            render: (val: string) => renderStatus(val),
        },
        {
            title: t('viTriManagementPage.hanh_dong'),
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
                            label: t('donViManagementPage.xem_chi_tiet'),
                            icon: <EyeOutlined />,
                            onClick: () => handleOpenModal('view', record),
                        } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.CAP_NHAT_PHIEU_SUA_CHUA_BAO_TRI)
                        ? {
                            key: 'edit',
                            label: t('phieuSuaChuaPage.chinh_sua'),
                            icon: <EditOutlined />,
                            onClick: () => handleOpenModal('edit', record),
                        } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.GUI_PHE_DUYET_PHIEU_SUA_CHUA_BAO_TRI)
                        ? {
                            key: 'request_approval',
                            label: t('donHangMuaSamPage.gui_phe_duyet'),
                            icon: <SendOutlined />,
                            onClick: () => handleYeuCauPheDuyet(record.id!),
                        } : null,

                    isChoDuyet && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_PHIEU_SUA_CHUA_BAO_TRI)
                        ? {
                            key: 'approve',
                            label: t('phieuSuaChuaPage.phe_duyet'),
                            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                            onClick: () => handlePheDuyet(record.id!),
                        } : null,

                    isDuyetOrThucHien && authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TIEN_DO_PSCBT)
                        ? {
                            key: 'progress',
                            label: t('phieuSuaChuaPage.cap_nhat_tien_do'),
                            icon: <InfoCircleOutlined style={{ color: '#722ed1' }} />,
                            onClick: () => handleOpenProgressModal(record),
                        } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.XOA_PHIEU_SUA_CHUA_BAO_TRI)
                        ? {
                            key: 'delete',
                            label: (
                                <Popconfirm
                                    title={t('viTriManagementPage.xac_nhan_xoa')}
                                    description={t('phieuSuaChuaPage.xoa_phieu_sua_chua')}
                                    onConfirm={() => handleXoa(record.id!)}
                                    okText={t('viTriManagementPage.xoa')}
                                    cancelText={t('viTriManagementPage.huy')}
                                >
                                    <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>{t('phieuSuaChuaPage.xoa_phieu')}</span>
                                </Popconfirm>
                            ),
                            icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                        } : null,
                ].filter(Boolean) as MenuProps['items'];

                if (!items || items.length === 0) return '-';

                return (
                    <Dropdown menu={{ items }} trigger={['click']}>
                        <Button size="small">
                            {t('common.actionBtn')} <DownOutlined />
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
                        <Title level={3} style={{ margin: 0 }}>{t('phieuSuaChuaPage.chung_tu_phieu_sua')}</Title>
                        <Text type="secondary">{t('phieuSuaChuaPage.quan_ly_lap_phieu')}</Text>
                    </div>
                    <QuyenHanGuard quyenYeuCau={QUYEN.THEM_MOI_PHIEU_SUA_CHUA_BAO_TRI}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('add')}>
                            {t('phieuSuaChuaPage.lap_phieu_sua_moi')}
                        </Button>
                    </QuyenHanGuard>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <Select
                                placeholder={t('phieuSuaChuaPage.trang_thai_chung_tu')}
                                style={{ width: '100%' }}
                                value={trangThai}
                                onChange={setTrangThai}
                                allowClear
                                options={[
                                    { value: 'TAO_MOI', label: t('phieuNhapTaiSanPage.tao_moi') },
                                    { value: 'GUI_PHE_DUYET', label: t('donHangMuaSamPage.cho_phe_duyet') },
                                    { value: 'DA_PHE_DUYET', label: t('donHangMuaSamPage.da_phe_duyet') },
                                    { value: 'DANG_THUC_HIEN', label: t('phieuSuaChuaPage.dang_thuc_hien') },
                                    { value: 'HOAN_THANH', label: t('donHangMuaSamPage.da_hoan_thanh') },
                                ]}
                            />
                        </Col>
                        <Col xs={24} md={10}>
                            <RangePicker
                                style={{ width: '100%' }}
                                value={dateRange}
                                onChange={setDateRange}
                                placeholder={[t('phieuSuaChuaPage.tu_ngay_lap'), t('phieuSuaChuaPage.den_ngay_lap')]}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <Space>
                                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>{t('phieuNhapTaiSanPage.tim_kiem')}</Button>
                                <Button onClick={handleReset}>{t('viTriManagementPage.lam_moi')}</Button>
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
                    title={t('phieuSuaChuaPage.cap_nhat_tien_do_thuc_1', { maPhieuSuaChua: selectedItem?.maPhieuSuaChua || '' })}
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
                                    title: t('phieuSuaChuaPage.ten_mau_tai_san'),
                                    dataIndex: 'tenMauTaiSan',
                                    key: 'tenMauTaiSan',
                                },
                                {
                                    title: t('phieuSuaChuaPage.loai'),
                                    dataIndex: 'loai',
                                    key: 'loaiTaiSan',
                                    width: 100,
                                    render: (val) => val === 'THIET_BI' ? t('phieuSuaChuaPage.thiet_bi') : t('phieuSuaChuaPage.linh_kien'),
                                },
                                {
                                    title: t('phieuSuaChuaPage.hinh_thuc'),
                                    dataIndex: 'loaiHinhXuLy',
                                    key: 'loaiHinhXuLy',
                                    width: 150,
                                    render: (val) => {
                                        if (val === 'GUI_BAO_HANH') return t('phieuSuaChuaPage.bao_hanh');
                                        if (val === 'SUA_CHUA_DICH_VU') return t('phieuSuaChuaPage.sua_dich_vu');
                                        return t('phieuSuaChuaPage.thay_the');
                                    }
                                },
                                {
                                    title: t('phieuSuaChuaPage.trang_thai_cu'),
                                    dataIndex: 'trangThaiThucHien',
                                    key: 'trangThaiThucHien',
                                    width: 120,
                                    render: (val) => renderItemStatus(val),
                                },
                                {
                                    title: t('phieuSuaChuaPage.trang_thai_moi'),
                                    key: 'trangThaiMoi',
                                    width: 150,
                                    render: (_, record) => (
                                        <Select
                                            value={progressFormValues[record.id!]?.trangThaiThucHienMoi}
                                            onChange={(val) => handleProgressValueChange(record.id!, 'trangThaiThucHienMoi', val)}
                                            style={{ width: '100%' }}
                                        >
                                            <Select.Option value="CHUA_GUI_DI">{t('phieuSuaChuaPage.chua_gui_di')}</Select.Option>
                                            <Select.Option value="DA_GUI_DI">{t('phieuSuaChuaPage.da_gui_di')}</Select.Option>
                                            <Select.Option value="DA_THU_LAI">{t('phieuSuaChuaPage.da_thu_lai_xong')}</Select.Option>
                                        </Select>
                                    )
                                },
                                {
                                    title: t('phieuSuaChuaPage.phuong_an_xu_ly'),
                                    key: 'phuongAn',
                                    width: 180,
                                    render: (_, record) => (
                                        <Input
                                            value={progressFormValues[record.id!]?.phuongAnXuLy}
                                            onChange={(e) => handleProgressValueChange(record.id!, 'phuongAnXuLy', e.target.value)}
                                            placeholder={t('phieuSuaChuaPage.ghi_nhan_xu_ly')}
                                        />
                                    )
                                },
                                {
                                    title: t('phieuSuaChuaPage.chi_phi_thuc_vnd'),
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
