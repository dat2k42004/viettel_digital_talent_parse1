import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SafetyOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import {
    layDanhSach14, // TODO: Trỏ đúng tên hàm Orval sinh ra (VD: layDanhSach20)
    themMoi14,
    capNhat14,
    capNhatTrangThai8,
    xoaMem14,
} from '../../../api-generated/endpoints/nha-cung-cap-controller/nha-cung-cap-controller';
import type { NhaCungCapResponse } from '../../../api-generated/models/nhaCungCapResponse';
import type { NhaCungCapRequest } from '../../../api-generated/models/nhaCungCapRequest';
import { NhaCungCapFormModal } from './NhaCungCapFormModal';

const { Title, Text } = Typography;

export const NhaCungCapPage: React.FC = observer(() => {
  const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [danhSach, setDanhSach] = useState<NhaCungCapResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filters
    const [keyword, setKeyword] = useState('');
    const [trangThai, setTrangThai] = useState<string | undefined>(undefined);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<NhaCungCapResponse | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');

    const taiDuLieu = async (page: number, size: number) => {
        setLoading(true);
        try {
            const res = await layDanhSach14({
                page: page - 1, // AntD 1-based, API 0-based
                size,
                keyword: keyword || undefined,
                trangThai: trangThai || undefined,
            });
            if (res.code === 200 && res.data) {
                setDanhSach(res.data.content || []);
                setTotalCount(res.data.page_info?.total_elements || 0);
            }
        } catch (e: any) {
            message.error(e?.message || t('nhaCungCapPage.khong_the_tai_danh'));
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
        setKeyword('');
        setTrangThai(undefined);
        setCurrentPage(1);
        setLoading(true);
        layDanhSach14({ page: 0, size: pageSize })
            .then((res) => {
                if (res.code === 200 && res.data) {
                    setDanhSach(res.data.content || []);
                    setTotalCount(res.data.page_info?.total_elements || 0);
                }
            })
            .catch(() => message.error(t('viTriManagementPage.khong_the_tai_lai')))
            .finally(() => setLoading(false));
    };

    const handleSaveForm = async (values: NhaCungCapRequest) => {
        try {
            if (selectedItem && selectedItem.id) {
                const res = await capNhat14(selectedItem.id, values);
                if (res.code === 200) {
                    message.success(t('nhaCungCapPage.cap_nhat_thong_tin'));
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || t('viTriManagementPage.cap_nhat_that_bai'));
                }
            } else {
                const res = await themMoi14(values);
                if (res.code === 200) {
                    message.success(t('nhaCungCapPage.them_moi_nha_cung'));
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || t('viTriManagementPage.them_moi_that_bai'));
                }
            }
        } catch (e: any) {
            message.error(e?.message || t('danhMucCauHinhPage.co_loi_xay_ra'));
        }
    };

    const handleToggleStatus = async (record: NhaCungCapResponse) => {
        if (!record.id) return;
        const currentStatus = record.trangThai || 'HOAT_DONG';
        const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
        try {
            const res = await capNhatTrangThai8(record.id, { trangThai: nextStatus });
            if (res.code === 200) {
                message.success(t('nhaCungCapPage.nextstatus_hoat_dong_t_vitrimanagementpage', { khoa: nextStatus === 'HOAT_DONG' ? t('viTriManagementPage.kich_hoat') : t('viTriManagementPage.khoa') }));
                taiDuLieu(currentPage, pageSize);
            } else {
                message.error(res.message || t('viTriManagementPage.cap_nhat_trang_thai'));
            }
        } catch (e: any) {
            message.error(e?.message || t('viTriManagementPage.co_loi_xay_ra'));
        }
    };

    const handleXoa = async (id: number) => {
        try {
            const res = await xoaMem14(id);
            if (res.code === 200) {
                message.success(t('nhaCungCapPage.xoa_nha_cung_cap_thanh_cong'));
                taiDuLieu(currentPage, pageSize);
            } else {
                message.error(res.message || t('viTriManagementPage.xoa_that_bai'));
            }
        } catch (e: any) {
            message.error(e?.message || t('nhaCungCapPage.khong_the_xoa_nha'));
        }
    };

    const renderStatus = (status: string) => {
        switch (status) {
            case 'HOAT_DONG':
                return <Tag color="green">{t('loaiTaiSanFormModal.dang_hoat_dong')}</Tag>;
            case 'KHOA':
                return <Tag color="red">{t('nhaCungCapPage.ngung_hop_tac')}</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: t('nhaCungCapPage.ma_ncc'),
            dataIndex: 'maNhaCungCap',
            key: 'maNhaCungCap',
            width: 140,
            sorter: (a: any, b: any) => (a.maNhaCungCap || '').localeCompare(b.maNhaCungCap || ''),
            defaultSortOrder: 'ascend' as const,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: t('nhaCungCapPage.ten_nha_cung_cap'),
            dataIndex: 'tenNhaCungCap',
            key: 'tenNhaCungCap',
        },
        {
            title: t('nhaCungCapPage.thong_tin_lien_he'),
            key: 'thongTinLienHe',
            render: (_: any, record: NhaCungCapResponse) => (
                <div>
                    <div>{t('nhaCungCapPage.recordnguoilienhe_chua_cap_nhat')}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        SĐT: {record.soDienThoai || 'N/A'} | Email: {record.email || 'N/A'}
                    </Text>
                </div>
            ),
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
            width: 120,
            render: (_: any, record: NhaCungCapResponse) => {
                const items: MenuProps['items'] = [
                    authStore.kiemTraQuyen(QUYEN.XEM_NHA_CUNG_CAP)
                        ? {
                            key: 'view',
                            label: t('donViManagementPage.xem_chi_tiet'),
                            icon: <EyeOutlined />,
                            onClick: () => {
                                setSelectedItem(record);
                                setFormMode('view');
                                setIsFormOpen(true);
                            },
                        }
                        : null,
                    authStore.kiemTraQuyen(QUYEN.SUA_NHA_CUNG_CAP)
                        ? {
                            key: 'edit',
                            label: t('viTriManagementPage.cap_nhat'),
                            icon: <EditOutlined />,
                            onClick: () => {
                                setSelectedItem(record);
                                setFormMode('edit');
                                setIsFormOpen(true);
                            },
                        }
                        : null,
                    authStore.kiemTraQuyen(QUYEN.CAP_NHAT_TRANG_THAI_NHA_CUNG_CAP)
                        ? {
                            key: 'toggle_status',
                            label: record.trangThai === 'HOAT_DONG' ? t('nhaCungCapPage.ngung_hop_tac') : t('nhaCungCapPage.kich_hoat_lai'),
                            icon: <SafetyOutlined />,
                            onClick: () => handleToggleStatus(record),
                        }
                        : null,
                    authStore.kiemTraQuyen(QUYEN.XOA_NHA_CUNG_CAP)
                        ? {
                            key: 'delete',
                            label: (
                                <Popconfirm
                                    title={t('viTriManagementPage.xac_nhan_xoa')}
                                    description={t('nhaCungCapPage.ban_co_chac_chan')}
                                    okText={t('viTriManagementPage.xoa')}
                                    cancelText={t('viTriManagementPage.huy')}
                                    onConfirm={() => handleXoa(record.id!)}
                                >
                                    <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>{t('nhaCungCapPage.xoa_nha_cung_cap')}</span>
                                </Popconfirm>
                            ),
                            icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                        }
                        : null,
                ].filter(Boolean) as MenuProps['items'];

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
        <QuyenHanGuard quyenYeuCau={QUYEN.XEM_NHA_CUNG_CAP}>
            <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>
                            Nhà cung cấp & Đối tác
                        </Title>
                        <Text type="secondary">
                            Quản lý danh bạ các đối tác cung ứng vật tư, trang thiết bị và bản quyền phần mềm.
                        </Text>
                    </div>
                    <QuyenHanGuard quyenYeuCau={QUYEN.THEM_NHA_CUNG_CAP}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setSelectedItem(null);
                                setFormMode('add');
                                setIsFormOpen(true);
                            }}
                        >
                            Thêm nhà cung cấp
                        </Button>
                    </QuyenHanGuard>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Input
                                placeholder={t('nhaCungCapPage.tim_kiem_theo_ma')}
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                prefix={<SearchOutlined />}
                                onPressEnter={handleSearch}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <Select
                                placeholder={t('nhaCungCapPage.trang_thai_hop_tac')}
                                style={{ width: '100%' }}
                                value={trangThai}
                                onChange={setTrangThai}
                                allowClear
                                options={[
                                    { value: 'HOAT_DONG', label: t('loaiTaiSanFormModal.dang_hoat_dong') },
                                    { value: 'KHOA', label: t('nhaCungCapPage.ngung_hop_tac') },
                                ]}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <Space>
                                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                                    Tìm kiếm
                                </Button>
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
                            onChange: (p, s) => {
                                setCurrentPage(p);
                                setPageSize(s);
                            },
                            showSizeChanger: true,
                        }}
                    />
                </Card>

                <NhaCungCapFormModal
                    open={isFormOpen}
                    onCancel={() => {
                        setIsFormOpen(false);
                        setSelectedItem(null);
                    }}
                    selectedRecord={selectedItem}
                    mode={formMode}
                    onSave={handleSaveForm}
                />
            </div>
        </QuyenHanGuard>
    );
});

export default NhaCungCapPage;