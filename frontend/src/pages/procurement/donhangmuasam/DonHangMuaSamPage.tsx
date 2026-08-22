import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
            message.error(e?.message || t('donHangMuaSamPage.khong_the_tai_danh'));
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
            .catch(() => message.error(t('viTriManagementPage.khong_the_tai_lai')))
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
                message.error(t('donHangMuaSamPage.loi_khi_lay_chi'));
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
                    message.success(t('donHangMuaSamPage.cap_nhat_don_hang'));
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
                }
            } else {
                const res = await themMoi22(values);
                if (res.code === 200) {
                    message.success(t('donHangMuaSamPage.tao_don_hang_mua'));
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
            const res = await yeuCauPheDuyet7(id);
            if (res.code === 200) {
                message.success(t('donHangMuaSamPage.da_gui_yeu_cau'));
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || t('donHangMuaSamPage.loi_khi_gui_phe'));
        }
    };

    const handlePheDuyet = async (id: number) => {
        try {
            const res = await pheDuyet7(id);
            if (res.code === 200) {
                message.success(t('donHangMuaSamPage.phe_duyet_don_hang'));
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || t('donHangMuaSamPage.loi_khi_phe_duyet'));
        }
    };

    const handleXoa = async (id: number) => {
        try {
            const res = await xoaMem22(id);
            if (res.code === 200) {
                message.success(t('donHangMuaSamPage.xoa_don_hang_thanh'));
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || t('donHangMuaSamPage.khong_the_xoa_don'));
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
            case 'HOAN_THANH':
                return <Tag color="green">{t('donHangMuaSamPage.da_hoan_thanh')}</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: t('donHangMuaSamPage.ma_po'),
            dataIndex: 'maDonHang',
            key: 'maDonHang',
            width: 150,
            sorter: (a: any, b: any) => (a.maDonHang || '').localeCompare(b.maDonHang || ''),
            defaultSortOrder: 'ascend' as const,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: t('donHangMuaSamPage.nha_cung_cap'),
            dataIndex: 'tenNhaCungCap',
            key: 'tenNhaCungCap',
        },
        {
            title: t('donHangMuaSamPage.ngay_giao_dk'),
            dataIndex: 'thoiGianGiaoDuKien',
            key: 'thoiGianGiaoDuKien',
            width: 120,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: t('donHangMuaSamPage.tong_tien_vnd'),
            dataIndex: 'tongTienSauThue',
            key: 'tongTienSauThue',
            width: 150,
            render: (val: number) => val ? val.toLocaleString('vi-VN') : '0',
        },
        {
            title: t('donHangMuaSamPage.nguoi_lap'),
            dataIndex: 'tenNguoiLap',
            key: 'tenNguoiLap',
            width: 160,
        },
        {
            title: t('loaiTaiSanFormModal.trang_thai'),
            dataIndex: 'trangThai',
            key: 'trangThai',
            width: 140,
            render: (val: string) => renderStatus(val),
        },
        {
            title: t('viTriManagementPage.hanh_dong'),
            key: 'hanhDong',
            width: 120,
            render: (_: any, record: DonHangMuaSamResponse) => {
                const isTaoMoi = record.trangThai === 'TAO_MOI';
                const isChoDuyet = record.trangThai === 'GUI_PHE_DUYET';

                const items: MenuProps['items'] = [
                    authStore.kiemTraQuyen(QUYEN.XEM_DON_HANG_MUA_SAM)
                        ? {
                            key: 'view',
                            label: t('donViManagementPage.xem_chi_tiet'),
                            icon: <EyeOutlined />,
                            onClick: () => handleOpenModal('view', record),
                        } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.SUA_DON_HANG_MUA_SAM)
                        ? {
                            key: 'edit',
                            label: t('donHangMuaSamPage.chinh_sua_don'),
                            icon: <EditOutlined />,
                            onClick: () => handleOpenModal('edit', record),
                        } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.YEU_CAU_PHE_DUYET_DON_HANG_MUA_SAM)
                        ? {
                            key: 'request_approval',
                            label: t('donHangMuaSamPage.gui_phe_duyet'),
                            icon: <SendOutlined />,
                            onClick: () => handleYeuCauPheDuyet(record.id!),
                        } : null,

                    isChoDuyet && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_DON_HANG_MUA_SAM)
                        ? {
                            key: 'approve',
                            label: t('donHangMuaSamPage.phe_duyet_don'),
                            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                            onClick: () => handlePheDuyet(record.id!),
                        } : null,

                    isTaoMoi && authStore.kiemTraQuyen(QUYEN.XOA_DON_HANG_MUA_SAM)
                        ? {
                            key: 'delete',
                            label: (
                                <Popconfirm
                                    title={t('viTriManagementPage.xac_nhan_xoa')}
                                    description={t('donHangMuaSamPage.xoa_don_hang_nay')}
                                    onConfirm={() => handleXoa(record.id!)}
                                    okText={t('viTriManagementPage.xoa')}
                                    cancelText={t('viTriManagementPage.huy')}
                                >
                                    <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>{t('donHangMuaSamPage.xoa_don_hang')}</span>
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
        <QuyenHanGuard quyenYeuCau={QUYEN.XEM_DON_HANG_MUA_SAM}>
            <div style={{ padding: 24, minHeight: 'calc(100vh - 112px)', borderRadius: 8 }}>
                <div className="page-header">
                    <div>
                        <Title level={3} style={{ margin: 0 }}>{t('donHangMuaSamPage.don_hang_mua_sam')}</Title>
                        <Text type="secondary">{t('donHangMuaSamPage.quan_ly_lap_ke')}</Text>
                    </div>
                    <QuyenHanGuard quyenYeuCau={QUYEN.THEM_DON_HANG_MUA_SAM}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('add')}>
                            {t('donHangMuaSamPage.lap_don_hang_moi')}
                        </Button>
                    </QuyenHanGuard>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={6}>
                            <Input
                                placeholder={t('donHangMuaSamPage.ma_don_hang_po')}
                                value={maDonHang}
                                onChange={(e) => setMaDonHang(e.target.value)}
                                prefix={<SearchOutlined />}
                                onPressEnter={handleSearch}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <Select
                                placeholder={t('donHangMuaSamPage.loc_theo_nha_cung')}
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
                                placeholder={t('donHangMuaSamPage.trang_thai_don_hang')}
                                style={{ width: '100%' }}
                                value={trangThai}
                                onChange={setTrangThai}
                                allowClear
                                options={[
                                    { value: 'TAO_MOI', label: t('phieuNhapTaiSanPage.tao_moi') },
                                    { value: 'GUI_PHE_DUYET', label: t('donHangMuaSamPage.cho_phe_duyet') },
                                    { value: 'DA_PHE_DUYET', label: t('donHangMuaSamPage.da_phe_duyet') },
                                    { value: 'HOAN_THANH', label: t('donHangMuaSamPage.da_hoan_thanh') },
                                ]}
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