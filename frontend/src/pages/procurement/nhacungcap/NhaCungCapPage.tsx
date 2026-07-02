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
            message.error(e?.message || 'Không thể tải danh sách nhà cung cấp!');
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
            .catch(() => message.error('Không thể tải lại danh sách!'))
            .finally(() => setLoading(false));
    };

    const handleSaveForm = async (values: NhaCungCapRequest) => {
        try {
            if (selectedItem && selectedItem.id) {
                const res = await capNhat14(selectedItem.id, values);
                if (res.code === 200) {
                    message.success('Cập nhật thông tin nhà cung cấp thành công!');
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || 'Cập nhật thất bại!');
                }
            } else {
                const res = await themMoi14(values);
                if (res.code === 200) {
                    message.success('Thêm mới nhà cung cấp thành công!');
                    setIsFormOpen(false);
                    taiDuLieu(currentPage, pageSize);
                } else {
                    message.error(res.message || 'Thêm mới thất bại!');
                }
            }
        } catch (e: any) {
            message.error(e?.message || 'Có lỗi xảy ra khi lưu thông tin!');
        }
    };

    const handleToggleStatus = async (record: NhaCungCapResponse) => {
        if (!record.id) return;
        const currentStatus = record.trangThai || 'HOAT_DONG';
        const nextStatus = currentStatus === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
        try {
            const res = await capNhatTrangThai8(record.id, { trangThai: nextStatus });
            if (res.code === 200) {
                message.success(`${nextStatus === 'HOAT_DONG' ? 'Kích hoạt' : 'Khóa'} nhà cung cấp thành công!`);
                taiDuLieu(currentPage, pageSize);
            } else {
                message.error(res.message || 'Cập nhật trạng thái thất bại!');
            }
        } catch (e: any) {
            message.error(e?.message || 'Có lỗi xảy ra!');
        }
    };

    const handleXoa = async (id: number) => {
        try {
            const res = await xoaMem14(id);
            if (res.code === 200) {
                message.success('Xóa nhà cung cấp thành công!');
                taiDuLieu(currentPage, pageSize);
            } else {
                message.error(res.message || 'Xóa thất bại!');
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể xóa nhà cung cấp!');
        }
    };

    const renderStatus = (status: string) => {
        switch (status) {
            case 'HOAT_DONG':
                return <Tag color="green">Đang hoạt động</Tag>;
            case 'KHOA':
                return <Tag color="red">Ngừng hợp tác</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: 'Mã NCC',
            dataIndex: 'maNhaCungCap',
            key: 'maNhaCungCap',
            width: 140,
            render: (val: string) => <Text strong>{val}</Text>,
        },
        {
            title: 'Tên nhà cung cấp / Đối tác',
            dataIndex: 'tenNhaCungCap',
            key: 'tenNhaCungCap',
        },
        {
            title: 'Thông tin liên hệ',
            key: 'thongTinLienHe',
            render: (_: any, record: NhaCungCapResponse) => (
                <div>
                    <div>{record.nguoiLienHe || 'Chưa cập nhật đại diện'}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        SĐT: {record.soDienThoai || 'N/A'} | Email: {record.email || 'N/A'}
                    </Text>
                </div>
            ),
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
            width: 120,
            render: (_: any, record: NhaCungCapResponse) => {
                const items: MenuProps['items'] = [
                    authStore.kiemTraQuyen(QUYEN.XEM_NHA_CUNG_CAP)
                        ? {
                            key: 'view',
                            label: 'Xem chi tiết',
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
                            label: 'Cập nhật',
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
                            label: record.trangThai === 'HOAT_DONG' ? 'Ngừng hợp tác' : 'Kích hoạt lại',
                            icon: <SafetyOutlined />,
                            onClick: () => handleToggleStatus(record),
                        }
                        : null,
                    authStore.kiemTraQuyen(QUYEN.XOA_NHA_CUNG_CAP)
                        ? {
                            key: 'delete',
                            label: (
                                <Popconfirm
                                    title="Xác nhận xóa"
                                    description="Bạn có chắc chắn muốn xóa nhà cung cấp này?"
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    onConfirm={() => handleXoa(record.id!)}
                                >
                                    <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Xóa nhà cung cấp</span>
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
                                placeholder="Tìm kiếm theo mã hoặc tên nhà cung cấp..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                prefix={<SearchOutlined />}
                                onPressEnter={handleSearch}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <Select
                                placeholder="Trạng thái hợp tác"
                                style={{ width: '100%' }}
                                value={trangThai}
                                onChange={setTrangThai}
                                allowClear
                                options={[
                                    { value: 'HOAT_DONG', label: 'Đang hoạt động' },
                                    { value: 'KHOA', label: 'Ngừng hợp tác' },
                                ]}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <Space>
                                <Button type="primary" onClick={handleSearch}>
                                    Tìm kiếm
                                </Button>
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