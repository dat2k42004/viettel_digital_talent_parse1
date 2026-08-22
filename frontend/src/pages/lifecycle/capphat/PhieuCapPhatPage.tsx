import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select, DatePicker, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined, CheckCircleOutlined, SendOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';

// Đã bổ sung thêm tuChoiPheDuyet3
import {
    layDanhSach13,
    layTheoId13,
    themMoi13,
    capNhat13,
    xoaMem13,
    yeuCauPheDuyet4,
    pheDuyet4,
    tuChoiPheDuyet3,
    hoanThanh3
} from '../../../api-generated/endpoints/phieu-cap-phat-tai-san-controller/phieu-cap-phat-tai-san-controller';
import { laySelectOptions4 as layPhongBanOptions } from '../../../api-generated/endpoints/phong-ban-controller/phong-ban-controller';
import type { PhieuCapPhatTaiSanResponse } from '../../../api-generated/models/phieuCapPhatTaiSanResponse';
import type { PhieuCapPhatTaiSanRequest } from '../../../api-generated/models/phieuCapPhatTaiSanRequest';
import type { SelectOption } from '../../../api-generated/models/selectOption';
import { PhieuCapPhatFormModal } from './PhieuCapPhatFormModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const PhieuCapPhatPage: React.FC = observer(() => {
  const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [danhSach, setDanhSach] = useState<PhieuCapPhatTaiSanResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filters
    const [trangThai, setTrangThai] = useState<string | undefined>(undefined);
    const [idPhongBan, setIdPhongBan] = useState<number | undefined>(undefined);
    const [dateRange, setDateRange] = useState<any>(null);
    const [phongBanOptions, setPhongBanOptions] = useState<SelectOption[]>([]);

    // Modals state (Form)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PhieuCapPhatTaiSanResponse | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

    // Modals state (Từ chối phê duyệt)
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
            const res = await layDanhSach13({
                page: page - 1,
                size,
                trangThai: trangThai || undefined,
                idPhongBan: idPhongBan || undefined,
                tuNgayBanGiao: dateRange?.[0] ? dayjs(dateRange[0]).format('YYYY-MM-DD') : undefined,
                denNgayBanGiao: dateRange?.[1] ? dayjs(dateRange[1]).format('YYYY-MM-DD') : undefined,
            });
            if (res.code === 200 && res.data) {
                // Tùy theo base response của dự án, có thể là res.data.content hoặc res.data.data.content
                const content = (res.data as any).content || [];
                const pageInfo = (res.data as any).page_info || {};
                setDanhSach(content);
                setTotalCount(pageInfo.total_elements || (res.data as any).totalElements || 0);
            }
        } catch (e: any) {
            message.error(e?.message || t('phieuCapPhatPage.khong_the_tai_danh'));
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

    const handleOpenModal = async (mode: 'add' | 'edit' | 'view', record?: PhieuCapPhatTaiSanResponse) => {
        setFormMode(mode);
        if (mode === 'add') {
            setSelectedItem(null);
            setIsFormOpen(true);
        } else if (record && record.id) {
            setLoading(true);
            try {
                const detailRes = await layTheoId13(record.id);
                if (detailRes.data) {
                    setSelectedItem(detailRes.data);
                    setIsFormOpen(true);
                }
            } catch (error) {
                message.error(t('phieuCapPhatPage.loi_khi_lay_chi'));
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveForm = async (values: PhieuCapPhatTaiSanRequest) => {
        setModalLoading(true);
        try {
            if (selectedItem && selectedItem.id) {
                const res = await capNhat13(selectedItem.id, values);
                if (res.code === 200) {
                    message.success(t('phieuSuaChuaPage.cap_nhat_phieu_thanh'));
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
                }
            } else {
                const res = await themMoi13(values);
                if (res.code === 200) {
                    message.success(t('phieuCapPhatPage.tao_phieu_cap_phat'));
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

    // Thực hiện hành động: Gửi duyệt, Phê duyệt, Hoàn thành, Xóa
    const handleHanhDong = async (action: string, id: number) => {
        try {
            let res;
            if (action === 'delete') {
                res = await xoaMem13(id);
                if (res.code === 200) message.success(t('phieuThuHoiPage.xoa_phieu_thanh_cong'));
            } else if (action === 'yeuCauPheDuyet') {
                res = await yeuCauPheDuyet4(id);
                if (res.code === 200) message.success(t('phieuThuHoiPage.da_gui_yeu_cau'));
            } else if (action === 'pheDuyet') {
                res = await pheDuyet4(id);
                if (res.code === 200) message.success(t('phieuThuHoiPage.phe_duyet_phieu_thanh'));
            } else if (action === 'hoanThanh') {
                res = await hoanThanh3(id);
                if (res.code === 200) message.success(t('phieuCapPhatPage.da_hoan_thanh_cap'));
            }
            if (res?.code === 200) taiDuLieu(currentPage, pageSize);
            else message.error(res?.message || t('phieuThuHoiPage.thao_tac_that_bai'));
        } catch (e: any) {
            message.error(e?.message || t('phieuThuHoiPage.loi_ket_noi_toi'));
        }
    };

    // Thực hiện hành động: Từ chối (Kèm lý do)
    const handleXacNhanTuChoi = async () => {
        if (!lyDoTuChoi.trim()) {
            message.warning(t('phieuCapPhatPage.vui_long_nhap_ly_do_tu_choi'));
            return;
        }
        try {
            const res = await tuChoiPheDuyet3(rejectId!, { lyDoTuChoi });
            if (res.code === 200) {
                message.success(t('phieuCapPhatPage.da_tu_choi_phe'));
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
            dataIndex: 'maPhiepCapPhat',
            key: 'maPhiepCapPhat',
            width: 140,
            sorter: (a: any, b: any) => (a.maPhiepCapPhat || '').localeCompare(b.maPhiepCapPhat || ''),
            defaultSortOrder: 'ascend' as const,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: t('phieuCapPhatPage.nguoi_nhan'),
            dataIndex: 'tenNguoiNhan',
            key: 'tenNguoiNhan',
        },
        {
            title: t('phieuCapPhatPage.phong_ban_nhan'),
            dataIndex: 'tenPhongBanNhan',
            key: 'tenPhongBanNhan',
        },
        {
            title: t('phieuCapPhatPage.nguoi_lap_phieu'),
            dataIndex: 'tenNguoiLap',
            key: 'tenNguoiLap',
        },
        {
            title: t('phieuThuHoiPage.ngay_tao'),
            dataIndex: 'thoiGianTao',
            key: 'thoiGianTao',
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-',
        },
        {
            title: t('loaiTaiSanFormModal.trang_thai'),
            dataIndex: 'trangThai',
            key: 'trangThai',
            width: 150,
            render: (val: string) => renderStatus(val),
        },
        {
            title: t('viTriManagementPage.hanh_dong'),
            key: 'hanhDong',
            width: 110,
            align: 'center' as const,
            render: (_: any, record: PhieuCapPhatTaiSanResponse) => {
                // Cậu hãy chắc chắn rằng biến QUYEN.PHE_DUYET_PHIEU_CAP_PHAT trong AuthStore.ts 
                // có giá trị chuỗi là "PHE_DUYET_PHIEU_CAP_PHAT" nhé.
                const items: MenuProps['items'] = [
                    authStore.kiemTraQuyen(QUYEN.XEM_PHIEU_CAP_PHAT) ? {
                        key: 'view',
                        label: t('donViManagementPage.xem_chi_tiet'),
                        icon: <EyeOutlined />,
                        onClick: () => handleOpenModal('view', record),
                    } : null,

                    (record.trangThai === 'TAO_MOI' && authStore.kiemTraQuyen(QUYEN.SUA_PHIEU_CAP_PHAT)) ? {
                        key: 'edit',
                        label: t('phieuNhapTaiSanPage.chinh_sua_phieu'),
                        icon: <EditOutlined />,
                        onClick: () => handleOpenModal('edit', record),
                    } : null,

                    (record.trangThai === 'TAO_MOI' && authStore.kiemTraQuyen(QUYEN.YEU_CAU_PHE_DUYET_PHIEU_CAP_PHAT)) ? {
                        key: 'submit',
                        label: t('donHangMuaSamPage.gui_phe_duyet'),
                        icon: <SendOutlined />,
                        onClick: () => handleHanhDong('yeuCauPheDuyet', record.id!),
                    } : null,

                    (record.trangThai === 'GUI_PHE_DUYET' && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_PHIEU_CAP_PHAT)) ? {
                        key: 'approve',
                        label: t('phieuSuaChuaPage.phe_duyet'),
                        icon: <CheckCircleOutlined style={{ color: '#1890ff' }} />,
                        onClick: () => handleHanhDong('pheDuyet', record.id!),
                    } : null,

                    (record.trangThai === 'GUI_PHE_DUYET' && authStore.kiemTraQuyen(QUYEN.PHE_DUYET_PHIEU_CAP_PHAT)) ? {
                        key: 'reject',
                        label: t('phieuThuHoiPage.tu_choi_phe_duyet'),
                        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                        onClick: () => {
                            setRejectId(record.id!);
                            setLyDoTuChoi('');
                            setIsRejectModalOpen(true);
                        },
                    } : null,

                    (record.trangThai === 'DA_PHE_DUYET' && authStore.kiemTraQuyen(QUYEN.HOAN_THANH_PHIEU_CAP_PHAT)) ? {
                        key: 'complete',
                        label: t('phieuCapPhatPage.hoan_thanh_cap_phat'),
                        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                        onClick: () => handleHanhDong('hoanThanh', record.id!),
                    } : null,

                    (record.trangThai === 'TAO_MOI' && authStore.kiemTraQuyen(QUYEN.XOA_PHIEU_CAP_PHAT)) ? {
                        key: 'delete',
                        label: (
                            <Popconfirm title={t('viTriManagementPage.xac_nhan_xoa')} description={t('phieuCapPhatPage.ban_co_chac_chan')} onConfirm={() => handleHanhDong('delete', record.id!)} okText={t('viTriManagementPage.xoa')} cancelText={t('viTriManagementPage.huy')}>
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
        <QuyenHanGuard quyenYeuCau={QUYEN.XEM_PHIEU_CAP_PHAT}>
            <div style={{ padding: 24 }}>
                <div className="page-header">
                    <div>
                        <Title level={3} style={{ margin: 0 }}>{t('phieuCapPhatPage.phieu_cap_phat_tai')}</Title>
                        <Text type="secondary">{t('phieuCapPhatPage.quan_ly_va_thuc')}</Text>
                    </div>
                    <QuyenHanGuard quyenYeuCau={QUYEN.THEM_PHIEU_CAP_PHAT}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal('add')}>
                            {t('phieuCapPhatPage.lap_phieu_cap_phat')}
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
                            <Select
                                placeholder={t('phieuCapPhatPage.loc_theo_phong_ban')}
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
                                placeholder={[t('phieuSuaChuaPage.tu_ngay_lap'), t('phieuSuaChuaPage.den_ngay_lap')]}
                            />
                        </Col>
                        <Col xs={24} md={6}>
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

                <PhieuCapPhatFormModal
                    open={isFormOpen}
                    loading={modalLoading}
                    selectedRecord={selectedItem}
                    mode={formMode}
                    onCancel={() => { setIsFormOpen(false); setSelectedItem(null); }}
                    onSave={handleSaveForm}
                />

                {/* Modal nhập lý do từ chối */}
                <Modal
                    title={t('phieuCapPhatPage.xac_nhan_tu_choi_phe_duyet')}
                    open={isRejectModalOpen}
                    onCancel={() => setIsRejectModalOpen(false)}
                    onOk={handleXacNhanTuChoi}
                    okText={t('keHoachBaoTriPage.xac_nhan_tu_choi')}
                    cancelText={t('viTriManagementPage.huy')}
                    okButtonProps={{ danger: true }}
                >
                    <div style={{ marginBottom: 8 }}>{t('phieuThuHoiPage.vui_long_nhap_ly')}</div>
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

export default PhieuCapPhatPage;