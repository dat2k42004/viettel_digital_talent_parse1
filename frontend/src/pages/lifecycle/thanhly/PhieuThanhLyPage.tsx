import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select, DatePicker, Modal, Input } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, CheckCircleOutlined, SendOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';

// Sử dụng đúng các hàm từ controller
import {
    layDanhSach8,
    layTheoId8,
    themMoi8,
    capNhat8,
    xoaMem8,
    yeuCauPheDuyet1,
    pheDuyet1,
    tuChoiPheDuyet1,
    hoanThanh1
} from '../../../api-generated/endpoints/phieu-thanh-ly-tai-san-controller/phieu-thanh-ly-tai-san-controller';

// IMPORT ĐÚNG CÁC DTO ĐƯỢC GENERATE
import type { PhieuThanhLyTaiSanResponse } from '../../../api-generated/models/phieuThanhLyTaiSanResponse';
import type { PhieuThanhLyTaiSanRequest } from '../../../api-generated/models/phieuThanhLyTaiSanRequest';

import { PhieuThanhLyFormModal } from './PhieuThanhLyFormModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const PhieuThanhLyPage: React.FC = observer(() => {
  const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    // Thay thế any bằng DTO Response
    const [danhSach, setDanhSach] = useState<PhieuThanhLyTaiSanResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filters
    const [trangThai, setTrangThai] = useState<string | undefined>(undefined);
    const [dateRange, setDateRange] = useState<any>(null);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    // Thay thế any bằng DTO Response
    const [selectedItem, setSelectedItem] = useState<PhieuThanhLyTaiSanResponse | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

    // Reject Modal state
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [lyDoTuChoi, setLyDoTuChoi] = useState('');

    const taiDuLieu = async (page: number, size: number) => {
        setLoading(true);
        try {
            const res = await layDanhSach8({
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
                setTotalCount(pageInfo.total_elements || (res.data as any).totalElements || 0);
            }
        } catch (e: any) {
            message.error(e?.message || t('phieuThanhLyPage.khong_the_tai_danh'));
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

    const handleOpenModal = async (mode: 'add' | 'edit' | 'view', record?: PhieuThanhLyTaiSanResponse) => {
        setFormMode(mode);
        if (mode === 'add') {
            setSelectedItem(null);
            setIsFormOpen(true);
        } else if (record && record.id) {
            setLoading(true);
            try {
                const detailRes = await layTheoId8(record.id);
                if (detailRes.data) {
                    setSelectedItem(detailRes.data as PhieuThanhLyTaiSanResponse);
                    setIsFormOpen(true);
                }
            } catch (error) {
                message.error(t('phieuThanhLyPage.loi_khi_lay_chi'));
            } finally {
                setLoading(false);
            }
        }
    };

    // Thay thế any bằng DTO Request
    const handleSaveForm = async (values: PhieuThanhLyTaiSanRequest) => {
        setModalLoading(true);
        try {
            if (selectedItem && selectedItem.id) {
                const res = await capNhat8(selectedItem.id, values);
                if (res.code === 200) {
                    message.success(t('phieuSuaChuaPage.cap_nhat_phieu_thanh'));
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
                }
            } else {
                const res = await themMoi8(values);
                if (res.code === 200) {
                    message.success(t('phieuThanhLyPage.tao_phieu_thanh_ly'));
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || t('viTriManagementPage.them_moi_that_bai'));
                }
            }
        } catch (e: any) {
            message.error(e?.message || t('phieuNhapTaiSanPage.co_loi_xay_ra'));
        } finally {
            setModalLoading(false);
        }
    };

    const handleHanhDong = async (action: string, id: number) => {
        try {
            let res;
            if (action === 'delete') {
                res = await xoaMem8(id);
                if (res.code === 200) message.success(t('phieuThuHoiPage.xoa_phieu_thanh_cong'));
            } else if (action === 'yeuCauPheDuyet') {
                res = await yeuCauPheDuyet1(id);
                if (res.code === 200) message.success(t('phieuThuHoiPage.da_gui_yeu_cau'));
            } else if (action === 'pheDuyet') {
                res = await pheDuyet1(id);
                if (res.code === 200) message.success(t('phieuThuHoiPage.phe_duyet_phieu_thanh'));
            } else if (action === 'hoanThanh') {
                res = await hoanThanh1(id);
                if (res.code === 200) message.success(t('phieuThanhLyPage.xac_nhan_hoan_thanh'));
            }
            if (res?.code === 200) taiDuLieu(currentPage, pageSize);
            else message.error(res?.message || t('phieuThuHoiPage.thao_tac_that_bai'));
        } catch (e: any) {
            message.error(e?.message || t('phieuThuHoiPage.loi_ket_noi_toi'));
        }
    };

    const handleXacNhanTuChoi = async () => {
        if (!lyDoTuChoi.trim()) {
            message.warning(t('phieuCapPhatPage.vui_long_nhap_ly_do_tu_choi'));
            return;
        }
        try {
            const res = await tuChoiPheDuyet1(rejectId!, { lyDoTuChoi });
            if (res.code === 200) {
                message.success(t('phieuThanhLyPage.da_tu_choi_phe'));
                setIsRejectModalOpen(false);
                taiDuLieu(currentPage, pageSize);
            } else {
                message.error(res.message || t('phieuThuHoiPage.tu_choi_that_bai'));
            }
        } catch (e: any) {
            message.error(e?.message || t('phieuThuHoiPage.loi_ket_noi_toi'));
        }
    };

    const renderStatus = (status: string) => {
        switch (status) {
            case 'TAO_MOI': return <Tag color="default">{t('phieuNhapTaiSanPage.tao_moi')}</Tag>;
            case 'GUI_PHE_DUYET': return <Tag color="warning">{t('donHangMuaSamPage.cho_phe_duyet')}</Tag>;
            case 'DA_PHE_DUYET': return <Tag color="processing">{t('donHangMuaSamPage.da_phe_duyet')}</Tag>;
            case 'HOAN_THANH': return <Tag color="success">{t('phieuSuaChuaPage.hoan_thanh')}</Tag>;
            case 'TU_CHOI': return <Tag color="error">{t('keHoachBaoTriPage.tu_choi')}</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: t('phieuSuaChuaPage.ma_phieu'),
            dataIndex: 'maPhieuThanhLy',
            key: 'maPhieuThanhLy',
            width: 150,
            sorter: (a: any, b: any) => (a.maPhieuThanhLy || '').localeCompare(b.maPhieuThanhLy || ''),
            defaultSortOrder: 'ascend' as const,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: t('donHangMuaSamPage.nguoi_lap'),
            dataIndex: 'tenNguoiLap',
            key: 'tenNguoiLap',
        },
        {
            title: t('phieuThanhLyPage.ly_do_thanh_ly'),
            dataIndex: 'lyDoThanhLy',
            key: 'lyDoThanhLy',
            ellipsis: true,
        },
        {
            title: t('phieuThuHoiPage.ngay_tao'),
            dataIndex: 'thoiGianTao',
            key: 'thoiGianTao',
            width: 150,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-',
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
            width: 110,
            align: 'center' as const,
            // Thay thế any bằng DTO Response
            render: (_: any, record: PhieuThanhLyTaiSanResponse) => {
                const items: MenuProps['items'] = [
                    authStore.kiemTraQuyen(QUYEN.XEM_PHIEU_THANH_LY) ? {
                        key: 'view',
                        label: t('donViManagementPage.xem_chi_tiet'),
                        icon: <EyeOutlined />,
                        onClick: () => handleOpenModal('view', record),
                    } : null,

                    (record.trangThai === 'TAO_MOI' && authStore.kiemTraQuyen(QUYEN.SUA_PHIEU_THANH_LY)) ? {
                        key: 'edit',
                        label: t('phieuNhapTaiSanPage.chinh_sua_phieu'),
                        icon: <EditOutlined />,
                        onClick: () => handleOpenModal('edit', record),
                    } : null,

                    (record.trangThai === 'TAO_MOI' && authStore.kiemTraQuyen(QUYEN.YEU_CAU_PHE_DUYET_THANH_LY)) ? {
                        key: 'submit',
                        label: t('donHangMuaSamPage.gui_phe_duyet'),
                        icon: <SendOutlined />,
                        onClick: () => handleHanhDong('yeuCauPheDuyet', record.id!),
                    } : null,

                    (record.trangThai === 'GUI_PHE_DUYET' && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_THANH_LY)) ? {
                        key: 'approve',
                        label: t('phieuSuaChuaPage.phe_duyet'),
                        icon: <CheckCircleOutlined style={{ color: '#1890ff' }} />,
                        onClick: () => handleHanhDong('pheDuyet', record.id!),
                    } : null,

                    (record.trangThai === 'GUI_PHE_DUYET' && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_THANH_LY)) ? {
                        key: 'reject',
                        label: t('phieuThuHoiPage.tu_choi_phe_duyet'),
                        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                        onClick: () => {
                            setRejectId(record.id!);
                            setLyDoTuChoi('');
                            setIsRejectModalOpen(true);
                        },
                    } : null,

                    (record.trangThai === 'DA_PHE_DUYET' && authStore.kiemTraQuyen(QUYEN.HOAN_THANH_THANH_LY)) ? {
                        key: 'complete',
                        label: t('phieuThanhLyPage.hoan_thanh_thanh_ly'),
                        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                        onClick: () => handleHanhDong('hoanThanh', record.id!),
                    } : null,

                    (record.trangThai === 'TAO_MOI' && authStore.kiemTraQuyen(QUYEN.XOA_PHIEU_THANH_LY)) ? {
                        key: 'delete',
                        label: (
                            <Popconfirm title={t('viTriManagementPage.xac_nhan_xoa')} description={t('phieuThanhLyPage.ban_co_chac_chan')} onConfirm={() => handleHanhDong('delete', record.id!)} okText={t('viTriManagementPage.xoa')} cancelText={t('viTriManagementPage.huy')}>
                                <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>{t('phieuSuaChuaPage.xoa_phieu')}</span>
                            </Popconfirm>
                        ),
                        icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                    } : null,
                ].filter(Boolean) as MenuProps['items'];

                if (!items || items.length === 0) return '-';

                return (
                    <Dropdown menu={{ items }} trigger={['click']}>
                        <Button size="small">{t('phieuNhapTaiSanPage.thao_tac')}<DownOutlined /></Button>
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <QuyenHanGuard quyenYeuCau={QUYEN.XEM_PHIEU_THANH_LY}>
            <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>{t('phieuThanhLyPage.phieu_thanh_ly_tai')}</Title>
                        <Text type="secondary">{t('phieuThanhLyPage.quan_ly_ban_huy')}</Text>
                    </div>
                    <QuyenHanGuard quyenYeuCau={QUYEN.THEM_PHIEU_THANH_LY}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('add')}>
                            Lập phiếu thanh lý
                        </Button>
                    </QuyenHanGuard>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={6}>
                            <Select
                                placeholder={t('loaiTaiSanFormModal.trang_thai')}
                                style={{ width: '100%' }}
                                value={trangThai}
                                onChange={setTrangThai}
                                allowClear
                                options={[
                                    { value: 'TAO_MOI', label: t('phieuNhapTaiSanPage.tao_moi') },
                                    { value: 'GUI_PHE_DUYET', label: t('donHangMuaSamPage.cho_phe_duyet') },
                                    { value: 'DA_PHE_DUYET', label: t('donHangMuaSamPage.da_phe_duyet') },
                                    { value: 'HOAN_THANH', label: t('phieuSuaChuaPage.hoan_thanh') },
                                    { value: 'TU_CHOI', label: t('keHoachBaoTriPage.tu_choi') },
                                ]}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <RangePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                value={dateRange}
                                onChange={setDateRange}
                                placeholder={[t('phieuSuaChuaPage.tu_ngay_lap'), t('phieuSuaChuaPage.den_ngay_lap')]}
                            />
                        </Col>
                        <Col xs={24} md={4}>
                            <Space>
                                <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>{t('phieuNhapTaiSanPage.tim_kiem')}</Button>
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

                <PhieuThanhLyFormModal
                    open={isFormOpen}
                    loading={modalLoading}
                    selectedRecord={selectedItem}
                    mode={formMode}
                    onCancel={() => { setIsFormOpen(false); setSelectedItem(null); }}
                    onSave={handleSaveForm}
                />

                <Modal
                    title={t('phieuCapPhatPage.xac_nhan_tu_choi_phe_duyet')}
                    open={isRejectModalOpen}
                    onCancel={() => setIsRejectModalOpen(false)}
                    onOk={handleXacNhanTuChoi}
                    okText={t('keHoachBaoTriPage.xac_nhan_tu_choi')}
                    cancelText={t('viTriManagementPage.huy')}
                    okButtonProps={{ danger: true }}
                >
                    <div style={{ marginBottom: 8 }}>{t('phieuThanhLyPage.vui_long_nhap_ly')}</div>
                    <Input.TextArea
                        rows={3}
                        placeholder={t('phieuThuHoiPage.ly_do')}
                        value={lyDoTuChoi}
                        onChange={(e) => setLyDoTuChoi(e.target.value)}
                    />
                </Modal>
            </div>
        </QuyenHanGuard>
    );
});

export default PhieuThanhLyPage;