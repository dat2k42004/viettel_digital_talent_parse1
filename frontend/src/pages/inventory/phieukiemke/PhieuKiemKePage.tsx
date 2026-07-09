import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
            message.error(e?.message || t('phieuKiemKePage.khong_the_tai_tien'));
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
            message.error(e?.message || t('phieuKiemKePage.khong_the_tai_danh'));
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
                message.error(t('phieuKiemKePage.loi_khi_lay_chi'));
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
                    message.success(t('phieuKiemKePage.cap_nhat_phieu_kiem'));
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
                }
            } else {
                const res = await themMoi(values);
                if (res.code === 200) {
                    message.success(t('phieuKiemKePage.tao_phieu_kiem_ke'));
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || t('viTriManagementPage.them_moi_that_bai'));
                }
            }
        } catch (e: any) {
            message.error(e?.message || t('phieuKiemKePage.co_loi_xay_ra_khi_luu_phieu_kiem_ke'));
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
                message.success(values.isSubmit ? t('phieuKiemKePage.da_gui_bao_cao') : t('phieuKiemKePage.da_luu_nhap_tien'));
                setIsFormOpen(false);
                taiDuLieu(currentPage, pageSize);
            } else {
                message.error(res.message || t('phieuKiemKePage.thuc_hien_kiem_ke'));
            }
        } catch (e: any) {
            message.error(e?.message || t('phieuKiemKePage.co_loi_xay_ra'));
        } finally {
            setModalLoading(false);
        }
    };

    const handleXacNhanHoanThanh = async (id: number) => {
        try {
            const res = await xacNhanHoanThanhPhongBan(id);
            if (res.code === 200) {
                message.success(t('phieuKiemKePage.da_phe_duyet_nghiem'));
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || t('phieuKiemKePage.loi_khi_phe_duyet'));
        }
    };

    const handleXoa = async (id: number) => {
        try {
            const res = await xoaMem(id);
            if (res.code === 200) {
                message.success(t('phieuKiemKePage.xoa_phieu_kiem_ke'));
                taiDuLieu(currentPage, pageSize);
            }
        } catch (e: any) {
            message.error(e?.message || t('phieuKiemKePage.khong_the_xoa_phieu'));
        }
    };

    const renderStatus = (status?: string) => {
        switch (status) {
            case 'TAO_MOI': return <Tag color="cyan">{t('phieuNhapTaiSanPage.tao_moi')}</Tag>;
            case 'DANG_THUC_HIEN': return <Tag color="purple">{t('phieuSuaChuaPage.dang_thuc_hien')}</Tag>;
            case 'DA_GUI': return <Tag color="orange">{t('phieuKiemKePage.cho_xac_nhan')}</Tag>;
            case 'XAC_NHAN': return <Tag color="green">{t('phieuKiemKePage.da_nghiem_thu')}</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: t('phieuSuaChuaPage.ma_phieu'),
            dataIndex: 'maPhieuKiemKe',
            key: 'maPhieuKiemKe',
            width: 155,
            sorter: (a: PhieuKiemKeResponse, b: PhieuKiemKeResponse) => (a.maPhieuKiemKe || '').localeCompare(b.maPhieuKiemKe || ''),
            defaultSortOrder: 'ascend' as const,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: t('phieuKiemKePage.ma_dot'),
            dataIndex: 'maDotKiemKe',
            key: 'maDotKiemKe',
            width: 140,
        },
        {
            title: t('phieuKiemKePage.ten_dot_kiem_ke'),
            dataIndex: 'tenDotKiemKe',
            key: 'tenDotKiemKe',
        },
        {
            title: t('phieuKiemKePage.phong_ban'),
            dataIndex: 'tenPhongBan',
            key: 'tenPhongBan',
        },
        {
            title: t('phieuKiemKePage.nhan_vien_kiem_ke'),
            dataIndex: 'tenNhanVienKiemKe',
            key: 'tenNhanVienKiemKe',
            width: 160,
        },
        {
            title: t('phieuKiemKePage.thoi_gian_thuc_hien'),
            dataIndex: 'thoiGianThucHien',
            key: 'thoiGianThucHien',
            width: 160,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-',
        },
        {
            title: t('phieuKiemKePage.thoi_gian_tao'),
            dataIndex: 'thoiGianTao',
            key: 'thoiGianTao',
            width: 130,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
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
                        label: t('donViManagementPage.xem_chi_tiet'),
                        icon: <EyeOutlined />,
                        onClick: () => handleOpenModal('view', record),
                    },
                    canViewProgress && record.dotKiemKeId ? {
                        key: 'progress',
                        label: t('phieuKiemKePage.theo_doi_tien_do'),
                        icon: <LineChartOutlined />,
                        onClick: () => handleOpenTienDo(record),
                    } : null,
                    canEdit ? {
                        key: 'edit',
                        label: t('phieuKiemKePage.sua_thong_tin'),
                        icon: <EditOutlined />,
                        onClick: () => handleOpenModal('edit', record),
                    } : null,
                    canExecute ? {
                        key: 'execute',
                        label: t('phieuKiemKePage.thuc_hien_doi_soat_1'),
                        icon: <AuditOutlined />,
                        onClick: () => handleOpenModal('execute', record),
                    } : null,
                    canVerify ? {
                        key: 'verify',
                        label: t('phieuKiemKePage.phe_duyet_nghiem_thu'),
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
                                title={t('phieuKiemKePage.ban_chac_chan_muon')}
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
                    <Title level={3} style={{ margin: 0 }}>{t('phieuKiemKePage.quan_ly_phieu_kiem')}</Title>
                    <Text type="secondary">{t('phieuKiemKePage.thuc_hien_doi_soat')}</Text>
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
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{t('phieuKiemKePage.trang_thai_phieu')}</div>
                        <Select
                            placeholder={t('phieuKiemKePage.tat_ca_trang_thai')}
                            style={{ width: '100%' }}
                            allowClear
                            value={trangThai}
                            onChange={setTrangThai}
                        >
                            <Select.Option value="TAO_MOI">{t('phieuNhapTaiSanPage.tao_moi')}</Select.Option>
                            <Select.Option value="DANG_THUC_HIEN">{t('phieuSuaChuaPage.dang_thuc_hien')}</Select.Option>
                            <Select.Option value="DA_GUI">{t('phieuKiemKePage.cho_xac_nhan')}</Select.Option>
                            <Select.Option value="XAC_NHAN">{t('phieuKiemKePage.da_nghiem_thu')}</Select.Option>
                        </Select>
                    </Col>
                    {!authStore.currentUserProfile?.idPhongBan && (
                        <Col xs={24} sm={8} md={6}>
                            <div style={{ fontWeight: 500, marginBottom: 4 }}>{t('phieuKiemKePage.phong_ban')}</div>
                            <Select
                                placeholder={t('phieuKiemKePage.tat_ca_phong_ban')}
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
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{t('phieuKiemKePage.thoi_gian_thuc_hien')}</div>
                        <RangePicker
                            style={{ width: '100%' }}
                            value={dateRange}
                            onChange={setDateRange}
                            placeholder={[t('phieuKiemKePage.tu_ngay'), t('phieuKiemKePage.den_ngay')]}
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
                        showTotal: (total) => t('dotKiemKePage.tong_so_total_ban_ghi', { total: total }),
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
                title={t('phieuKiemKePage.theo_doi_tien_do_kiem', { maPhieuKiemKe: selectedPhieu?.maPhieuKiemKe || '' })}
                open={isTienDoModalOpen}
                onCancel={() => setIsTienDoModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsTienDoModalOpen(false)}>{t('phieuNhapTaiSanFormModal.dong')}</Button>
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
                            title: t('phieuKiemKePage.phong_ban'),
                            dataIndex: 'tenPhongBan',
                            key: 'tenPhongBan',
                        },
                        {
                            title: t('phieuKiemKePage.trang_thai_phieu'),
                            dataIndex: 'trangThaiPhieu',
                            key: 'trangThaiPhieu',
                            render: (val: string) => {
                                switch (val) {
                                    case 'TAO_MOI': return <Tag color="cyan">{t('phieuNhapTaiSanPage.tao_moi')}</Tag>;
                                    case 'DANG_THUC_HIEN': return <Tag color="purple">{t('phieuSuaChuaPage.dang_thuc_hien')}</Tag>;
                                    case 'DA_GUI': return <Tag color="orange">{t('phieuKiemKePage.cho_xac_nhan')}</Tag>;
                                    case 'XAC_NHAN': return <Tag color="green">{t('phieuKiemKePage.da_nghiem_thu')}</Tag>;
                                    default: return <Tag color="default">{t('phieuKiemKePage.val_chua_lap_phieu')}</Tag>;
                                }
                            }
                        },
                        {
                            title: t('phieuKiemKePage.da_kiem_tong_so'),
                            key: 'soLuong',
                            render: (_, row) => `${row.soLuongDaKiem ?? 0} / ${row.tongSoLuongTaiSan ?? 0}`,
                        },
                        {
                            title: t('phieuKiemKePage.tien_do'),
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
