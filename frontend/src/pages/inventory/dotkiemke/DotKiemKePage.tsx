import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select, DatePicker } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import {
    layDanhSach21 as layDanhSach,
    layTheoId20 as layTheoId,
    themMoi21 as themMoi,
    capNhat20 as capNhat,
    xoaMem20 as xoaMem,
    yeuCauPheDuyet6 as yeuCauPheDuyet,
    pheDuyet6 as pheDuyet
} from '../../../api-generated/endpoints/dot-kiem-ke-controller/dot-kiem-ke-controller';
import type { DotKiemKeResponse } from '../../../api-generated/models/dotKiemKeResponse';
import type { DotKiemKeRequest } from '../../../api-generated/models/dotKiemKeRequest';
import { DotKiemKeFormModal } from './DotKiemKeFormModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const DotKiemKePage: React.FC = observer(() => {
  const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [danhSach, setDanhSach] = useState<DotKiemKeResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filters
    const [trangThai, setTrangThai] = useState<string | undefined>(undefined);
    const [dateRange, setDateRange] = useState<any>(null);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DotKiemKeResponse | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

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
            message.error(e?.message || t('dotKiemKePage.khong_the_tai_danh'));
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

    const handleOpenModal = async (mode: 'add' | 'edit' | 'view', record?: DotKiemKeResponse) => {
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
                message.error(t('dotKiemKePage.loi_khi_lay_chi'));
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveForm = async (values: DotKiemKeRequest) => {
        setModalLoading(true);
        try {
            if (selectedItem && selectedItem.id) {
                const res = await capNhat(selectedItem.id, values);
                if (res.code === 200) {
                    message.success(t('dotKiemKePage.cap_nhat_dot_kiem'));
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
                }
            } else {
                const res = await themMoi(values);
                if (res.code === 200) {
                    message.success(t('dotKiemKePage.tao_dot_kiem_ke'));
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || t('viTriManagementPage.them_moi_that_bai'));
                }
            }
        } catch (e: any) {
            message.error(e?.message || t('dotKiemKePage.co_loi_xay_ra'));
        } finally {
            setModalLoading(false);
        }
    };

    const handleYeuCauPheDuyet = async (id: number) => {
        try {
            const res = await yeuCauPheDuyet(id);
            if (res.code === 200) {
                message.success(t('dotKiemKePage.da_gui_yeu_cau'));
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
                message.success(t('dotKiemKePage.phe_duyet_dot_kiem'));
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || t('donHangMuaSamPage.loi_khi_phe_duyet'));
        }
    };

    const handleXoa = async (id: number) => {
        try {
            const res = await xoaMem(id);
            if (res.code === 200) {
                message.success(t('dotKiemKePage.xoa_dot_kiem_ke'));
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || t('dotKiemKePage.khong_the_xoa_dot'));
        }
    };

    const renderStatus = (status?: string) => {
        switch (status) {
            case 'TAO_MOI': return <Tag color="cyan">{t('phieuNhapTaiSanPage.tao_moi')}</Tag>;
            case 'GUI_PHE_DUYET': return <Tag color="orange">{t('donHangMuaSamPage.cho_phe_duyet')}</Tag>;
            case 'DA_PHE_DUYET': return <Tag color="blue">{t('donHangMuaSamPage.da_phe_duyet')}</Tag>;
            case 'DANG_THUC_HIEN': return <Tag color="purple">{t('phieuSuaChuaPage.dang_thuc_hien')}</Tag>;
            case 'HOAN_THANH': return <Tag color="green">{t('phieuSuaChuaPage.hoan_thanh')}</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: t('phieuKiemKePage.ma_dot'),
            dataIndex: 'maDotKiemKe',
            key: 'maDotKiemKe',
            width: 140,
            sorter: (a: DotKiemKeResponse, b: DotKiemKeResponse) => (a.maDotKiemKe || '').localeCompare(b.maDotKiemKe || ''),
            defaultSortOrder: 'ascend' as const,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: t('phieuKiemKePage.ten_dot_kiem_ke'),
            dataIndex: 'tenDotKiemKe',
            key: 'tenDotKiemKe',
        },
        {
            title: t('donHangMuaSamPage.nguoi_lap'),
            dataIndex: 'tenNguoiLap',
            key: 'tenNguoiLap',
            width: 150,
        },
        {
            title: t('dotKiemKePage.nguoi_phe_duyet'),
            dataIndex: 'tenNguoiPheDuyet',
            key: 'tenNguoiPheDuyet',
            width: 150,
            render: (val: string) => val || '-',
        },
        {
            title: t('dotKiemKePage.bat_dau_du_kien'),
            dataIndex: 'thoiGianBatDauDuKien',
            key: 'thoiGianBatDauDuKien',
            width: 140,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: t('dotKiemKePage.ket_thuc_du_kien'),
            dataIndex: 'thoiGianKetThucDuKien',
            key: 'thoiGianKetThucDuKien',
            width: 140,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
        },
        {
            title: t('dotKiemKePage.ts_he_thong'),
            dataIndex: 'tongTaiSanHeThong',
            key: 'tongTaiSanHeThong',
            width: 110,
            render: (val: number) => val ?? 0,
        },
        {
            title: t('dotKiemKePage.ts_thuc_te'),
            dataIndex: 'tongTaiSanThucTe',
            key: 'tongTaiSanThucTe',
            width: 110,
            render: (val: number) => val ?? 0,
        },
        {
            title: t('loaiTaiSanFormModal.trang_thai'),
            dataIndex: 'trangThai',
            key: 'trangThai',
            width: 135,
            render: (val: string) => renderStatus(val),
        },
        {
            title: t('viTriManagementPage.hanh_dong'),
            key: 'actions',
            width: 120,
            fixed: 'right' as const,
            render: (_: any, record: DotKiemKeResponse) => {
                const canEdit = authStore.kiemTraQuyen(QUYEN.CAP_NHAT_DKK) && record.trangThai === 'TAO_MOI';
                const canDelete = authStore.kiemTraQuyen(QUYEN.XOA_DKK) && record.trangThai === 'TAO_MOI';
                const canRequestApprove = authStore.kiemTraQuyen(QUYEN.GUI_PHE_DUYET_DKK) && record.trangThai === 'TAO_MOI';
                const canApprove = authStore.kiemTraQuyen(QUYEN.PHE_DUYET_DKK) && record.trangThai === 'GUI_PHE_DUYET';

                const items: MenuProps['items'] = [
                    {
                        key: 'view',
                        label: t('donViManagementPage.xem_chi_tiet'),
                        icon: <EyeOutlined />,
                        onClick: () => handleOpenModal('view', record),
                    },
                    canEdit ? {
                        key: 'edit',
                        label: t('phieuKiemKePage.sua_thong_tin'),
                        icon: <EditOutlined />,
                        onClick: () => handleOpenModal('edit', record),
                    } : null,
                    canRequestApprove ? {
                        key: 'send',
                        label: t('donHangMuaSamPage.gui_phe_duyet'),
                        icon: <SendOutlined />,
                        onClick: () => handleYeuCauPheDuyet(record.id!),
                    } : null,
                    canApprove ? {
                        key: 'approve',
                        label: t('phieuSuaChuaPage.phe_duyet'),
                        icon: <CheckCircleOutlined />,
                        onClick: () => handlePheDuyet(record.id!),
                    } : null,
                    canDelete ? {
                        type: 'divider',
                    } : null,
                    canDelete ? {
                        key: 'delete',
                        label: (
                            <Popconfirm
                                title={t('dotKiemKePage.ban_chac_chan_muon')}
                                onConfirm={() => handleXoa(record.id!)}
                                okText={t('viTriManagementPage.xoa')}
                                cancelText={t('viTriManagementPage.huy')}
                                okButtonProps={{ danger: true }}
                            >
                                <span style={{ color: '#ff4d4f' }}>{t('phieuKiemKePage.xoa_bo')}</span>
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
                    <Title level={3} style={{ margin: 0 }}>{t('dotKiemKePage.quan_ly_dot_kiem')}</Title>
                    <Text type="secondary">{t('dotKiemKePage.quan_ly_va_lap')}</Text>
                </div>
                <QuyenHanGuard quyenYeuCau={QUYEN.THEM_MOI_DKK}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('add')}>
                        Thêm mới đợt kiểm kê
                    </Button>
                </QuyenHanGuard>
            </div>

            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{t('loaiTaiSanFormModal.trang_thai')}</div>
                        <Select
                            placeholder={t('phieuKiemKePage.tat_ca_trang_thai')}
                            style={{ width: '100%' }}
                            allowClear
                            value={trangThai}
                            onChange={setTrangThai}
                        >
                            <Select.Option value="TAO_MOI">{t('phieuNhapTaiSanPage.tao_moi')}</Select.Option>
                            <Select.Option value="GUI_PHE_DUYET">{t('donHangMuaSamPage.cho_phe_duyet')}</Select.Option>
                            <Select.Option value="DA_PHE_DUYET">{t('donHangMuaSamPage.da_phe_duyet')}</Select.Option>
                            <Select.Option value="DANG_THUC_HIEN">{t('phieuSuaChuaPage.dang_thuc_hien')}</Select.Option>
                            <Select.Option value="HOAN_THANH">{t('phieuSuaChuaPage.hoan_thanh')}</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={10} md={8}>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{t('dotKiemKePage.thoi_gian_bat_dauket')}</div>
                        <RangePicker
                            style={{ width: '100%' }}
                            value={dateRange}
                            onChange={setDateRange}
                            placeholder={[t('phieuKiemKePage.tu_ngay'), t('phieuKiemKePage.den_ngay')]}
                            format="DD/MM/YYYY"
                        />
                    </Col>
                    <Col xs={24} sm={6} md={6} style={{ display: 'flex', alignItems: 'flex-end', paddingTop: 24 }}>
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
                        showTotal: (total) => t('dotKiemKePage.tong_so_total_ban_ghi', { total: total }),
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        }
                    }}
                />
            </Card>

            <DotKiemKeFormModal
                open={isFormOpen}
                onCancel={() => setIsFormOpen(false)}
                selectedRecord={selectedItem}
                mode={formMode}
                onSave={handleSaveForm}
                loading={modalLoading}
            />
        </div>
    );
});

export default DotKiemKePage;
