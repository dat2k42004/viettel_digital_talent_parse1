import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
            message.error(e?.message || t('keHoachBaoTriPage.khong_the_tai_danh'));
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
                message.error(t('keHoachBaoTriPage.loi_khi_lay_chi'));
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
                    message.success(t('keHoachBaoTriPage.cap_nhat_ke_hoach'));
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
                }
            } else {
                const res = await themMoi(values);
                if (res.code === 200) {
                    message.success(t('keHoachBaoTriPage.tao_ke_hoach_bao'));
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || t('viTriManagementPage.them_moi_that_bai'));
                }
            }
        } catch (e: any) {
            message.error(e?.message || t('keHoachBaoTriPage.co_loi_xay_ra'));
        } finally {
            setModalLoading(false);
        }
    };

    const handleYeuCauPheDuyet = async (id: number) => {
        try {
            const res = await yeuCauPheDuyet(id);
            if (res.code === 200) {
                message.success(t('keHoachBaoTriPage.da_gui_yeu_cau'));
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
                message.success(t('keHoachBaoTriPage.phe_duyet_ke_hoach'));
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || t('donHangMuaSamPage.loi_khi_phe_duyet'));
        }
    };

    const handleRejectClick = (id: number) => {
        setRejectId(id);
        setLyDoTuChoi('');
        setIsRejectModalOpen(true);
    };

    const handleConfirmReject = async () => {
        if (!lyDoTuChoi.trim()) {
            message.error(t('phieuCapPhatPage.vui_long_nhap_ly_do_tu_choi'));
            return;
        }
        if (rejectId === null) return;

        try {
            const res = await tuChoiPheDuyet(rejectId, { lyDoTuChoi: lyDoTuChoi.trim() });
            if (res.code === 200) {
                message.success(t('keHoachBaoTriPage.da_tu_choi_phe'));
                setIsRejectModalOpen(false);
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || t('keHoachBaoTriPage.loi_khi_tu_choi'));
        }
    };

    const handleXoa = async (id: number) => {
        try {
            const res = await xoaMem(id);
            if (res.code === 200) {
                message.success(t('keHoachBaoTriPage.xoa_ke_hoach_bao_tri_thanh_cong'));
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || t('keHoachBaoTriPage.khong_the_xoa_ke'));
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
            case 'TU_CHOI':
                return <Tag color="red">{t('keHoachBaoTriPage.tu_choi')}</Tag>;
            case 'HOAN_THANH':
                return <Tag color="green">{t('donHangMuaSamPage.da_hoan_thanh')}</Tag>;
            case 'HET_HAN':
                return <Tag color="default">{t('keHoachBaoTriPage.het_han')}</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const formatChuKy = (chuKy: string) => {
        switch (chuKy) {
            case 'HANG_TUAN': return t('keHoachBaoTriPage.hang_tuan');
            case 'HANG_THANG': return t('keHoachBaoTriPage.hang_thang');
            case 'HANG_QUY': return t('keHoachBaoTriPage.hang_quy');
            case 'HANG_NAM': return t('keHoachBaoTriPage.hang_nam');
            default: return chuKy;
        }
    };

    const columns = [
        {
            title: t('keHoachBaoTriPage.ma_ke_hoach'),
            dataIndex: 'maKeHoach',
            key: 'maKeHoach',
            width: 160,
            sorter: (a: KeHoachBaoTriDinhKyResponse, b: KeHoachBaoTriDinhKyResponse) => (a.maKeHoach || '').localeCompare(b.maKeHoach || ''),
            defaultSortOrder: 'ascend' as const,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: t('keHoachBaoTriPage.ten_ke_hoach'),
            dataIndex: 'tenKeHoach',
            key: 'tenKeHoach',
        },
        {
            title: t('keHoachBaoTriPage.chu_ky'),
            dataIndex: 'chuKyLap',
            key: 'chuKyLap',
            width: 120,
            render: (val: string) => formatChuKy(val),
        },
        {
            title: t('keHoachBaoTriPage.bat_dau'),
            dataIndex: 'thoiGianBatDauKeHoach',
            key: 'thoiGianBatDauKeHoach',
            width: 120,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: t('keHoachBaoTriPage.ket_thuc'),
            dataIndex: 'thoiGianKetThucKeHoach',
            key: 'thoiGianKetThucKeHoach',
            width: 120,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: t('keHoachBaoTriPage.du_kien_vnd'),
            dataIndex: 'chiPhiDuKien',
            key: 'chiPhiDuKien',
            width: 130,
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
            render: (_: any, record: KeHoachBaoTriDinhKyResponse) => {
                const isTaoMoi = record.trangThai === 'TAO_MOI';
                const isTuChoi = record.trangThai === 'TU_CHOI';
                const isChoDuyet = record.trangThai === 'GUI_PHE_DUYET';

                const items: MenuProps['items'] = [
                    authStore.kiemTraQuyen(QUYEN.XEM_CHI_TIET_KHBTDK)
                        ? {
                            key: 'view',
                            label: t('donViManagementPage.xem_chi_tiet'),
                            icon: <EyeOutlined />,
                            onClick: () => handleOpenModal('view', record),
                        } : null,

                    (isTaoMoi || isTuChoi) && authStore.kiemTraQuyen(QUYEN.CAP_NHAT_KHBTDK)
                        ? {
                            key: 'edit',
                            label: t('phieuSuaChuaPage.chinh_sua'),
                            icon: <EditOutlined />,
                            onClick: () => handleOpenModal('edit', record),
                        } : null,

                    (isTaoMoi || isTuChoi) && authStore.kiemTraQuyen(QUYEN.GUI_PHE_DUYET_KHBTDK)
                        ? {
                            key: 'request_approval',
                            label: t('donHangMuaSamPage.gui_phe_duyet'),
                            icon: <SendOutlined />,
                            onClick: () => handleYeuCauPheDuyet(record.id!),
                        } : null,

                    isChoDuyet && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_KHBTDK)
                        ? {
                            key: 'approve',
                            label: t('phieuSuaChuaPage.phe_duyet'),
                            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                            onClick: () => handlePheDuyet(record.id!),
                        } : null,

                    isChoDuyet && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_KHBTDK)
                        ? {
                            key: 'reject',
                            label: t('keHoachBaoTriPage.tu_choi_duyet'),
                            icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                            onClick: () => handleRejectClick(record.id!),
                        } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.XOA_KHBTDK)
                        ? {
                            key: 'delete',
                            label: (
                                <Popconfirm
                                    title={t('viTriManagementPage.xac_nhan_xoa')}
                                    description={t('keHoachBaoTriPage.xoa_ke_hoach_bao')}
                                    onConfirm={() => handleXoa(record.id!)}
                                    okText={t('viTriManagementPage.xoa')}
                                    cancelText={t('viTriManagementPage.huy')}
                                >
                                    <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>{t('keHoachBaoTriPage.xoa_ke_hoach')}</span>
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
        <QuyenHanGuard quyenYeuCau={QUYEN.NHOM_KE_HOACH_BAO_TRI}>
            <div style={{ padding: 24, minHeight: 'calc(100vh - 112px)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>{t('keHoachBaoTriPage.ke_hoach_bao_tri')}</Title>
                        <Text type="secondary">{t('keHoachBaoTriPage.quan_ly_lap_ke')}</Text>
                    </div>
                    <QuyenHanGuard quyenYeuCau={QUYEN.THEM_MOI_KHBTDK}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('add')}>
                            {t('keHoachBaoTriPage.lap_ke_hoach_moi')}
                        </Button>
                    </QuyenHanGuard>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <Select
                                placeholder={t('keHoachBaoTriPage.trang_thai_ke_hoach')}
                                style={{ width: '100%' }}
                                value={trangThai}
                                onChange={setTrangThai}
                                allowClear
                                options={[
                                    { value: 'TAO_MOI', label: t('phieuNhapTaiSanPage.tao_moi') },
                                    { value: 'GUI_PHE_DUYET', label: t('donHangMuaSamPage.cho_phe_duyet') },
                                    { value: 'DA_PHE_DUYET', label: t('donHangMuaSamPage.da_phe_duyet') },
                                    { value: 'TU_CHOI', label: t('keHoachBaoTriPage.tu_choi') },
                                    { value: 'HOAN_THANH', label: t('donHangMuaSamPage.da_hoan_thanh') },
                                    { value: 'HET_HAN', label: t('keHoachBaoTriPage.het_han_ke_hoach') },
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

                <KeHoachBaoTriFormModal
                    open={isFormOpen}
                    loading={modalLoading}
                    selectedRecord={selectedItem}
                    mode={formMode}
                    onCancel={() => { setIsFormOpen(false); setSelectedItem(null); }}
                    onSave={handleSaveForm}
                />

                <Modal
                    title={t('keHoachBaoTriPage.tu_choi_phe_duyet')}
                    open={isRejectModalOpen}
                    onOk={handleConfirmReject}
                    onCancel={() => setIsRejectModalOpen(false)}
                    okText={t('keHoachBaoTriPage.xac_nhan_tu_choi')}
                    okButtonProps={{ danger: true }}
                    cancelText={t('appLayout.cancel')}
                >
                    <div style={{ marginTop: 16 }}>
                        <Text strong>{t('keHoachBaoTriPage.ly_do_tu_choi')}</Text>
                        <Input.TextArea
                            rows={4}
                            placeholder={t('keHoachBaoTriPage.vui_long_nhap_ly')}
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
