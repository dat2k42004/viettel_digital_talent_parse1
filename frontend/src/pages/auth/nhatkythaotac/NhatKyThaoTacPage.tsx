import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, Modal, Descriptions, Row, Col, Select, DatePicker, message } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import { layDanhSach27 } from '../../../api-generated/endpoints/nhat-ky-thao-tac-he-thong-controller/nhat-ky-thao-tac-he-thong-controller';
import { laySelectOptions6 as layNguoiDungOptions } from '../../../api-generated/endpoints/nguoi-dung-controller/nguoi-dung-controller';
import type { NhatKyThaoTacHeThongResponse } from '../../../api-generated/models/nhatKyThaoTacHeThongResponse';
import type { SelectOption } from '../../../api-generated/models/selectOption';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const NhatKyThaoTacPage: React.FC = observer(() => {
    const [loading, setLoading] = useState(false);
    const [danhSach, setDanhSach] = useState<NhatKyThaoTacHeThongResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filters
    const [idTaiKhoanThaoTac, setIdTaiKhoanThaoTac] = useState<number | undefined>(undefined);
    const [phuongThucApi, setPhuongThucApi] = useState<string | undefined>(undefined);
    const [thucTheTacDong, setThucTheTacDong] = useState<string>('');
    const [dateRange, setDateRange] = useState<any>(null);

    // Dropdown options
    const [nguoiDungOptions, setNguoiDungOptions] = useState<SelectOption[]>([]);

    // Detail Modal
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<NhatKyThaoTacHeThongResponse | null>(null);

    useEffect(() => {
        layNguoiDungOptions()
            .then(res => {
                if (res.data) setNguoiDungOptions(res.data);
            })
            .catch(() => { });
    }, []);

    const taiDuLieu = async (page: number, size: number) => {
        setLoading(true);
        try {
            const res = await layDanhSach27({
                page: page - 1,
                size,
                idTaiKhoanThaoTac: idTaiKhoanThaoTac || undefined,
                phuongThucApi: phuongThucApi || undefined,
                thucTheTacDong: thucTheTacDong.trim() || undefined,
                tuNgay: dateRange?.[0] ? dayjs(dateRange[0]).startOf('day').toISOString() : undefined,
                denNgay: dateRange?.[1] ? dayjs(dateRange[1]).endOf('day').toISOString() : undefined,
            });
            if (res.code === 200 && res.data) {
                setDanhSach(res.data.content || []);
                setTotalCount(res.data.page_info?.total_elements || 0);
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể tải nhật ký thao tác!');
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
        setIdTaiKhoanThaoTac(undefined);
        setPhuongThucApi(undefined);
        setThucTheTacDong('');
        setDateRange(null);
        setCurrentPage(1);
        taiDuLieu(1, pageSize);
    };

    const handleOpenDetail = (record: NhatKyThaoTacHeThongResponse) => {
        setSelectedLog(record);
        setIsDetailOpen(true);
    };

    const renderMethod = (method?: string) => {
        if (!method) return '-';
        switch (method.toUpperCase()) {
            case 'POST': return <Tag color="green">POST</Tag>;
            case 'PUT': return <Tag color="blue">PUT</Tag>;
            case 'DELETE': return <Tag color="red">DELETE</Tag>;
            case 'GET': return <Tag color="orange">GET</Tag>;
            default: return <Tag>{method}</Tag>;
        }
    };

    const getUserLabel = (id?: number) => {
        if (!id) return 'Hệ thống';
        const user = nguoiDungOptions.find(opt => opt.id === id);
        return user ? user.ten : `Tài khoản ID: ${id}`;
    };

    const formatJson = (jsonStr?: string) => {
        if (!jsonStr) return 'Không có dữ liệu';
        try {
            const parsed = JSON.parse(jsonStr);
            return JSON.stringify(parsed, null, 2);
        } catch {
            return jsonStr;
        }
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'thoiGianThaoTac',
            key: 'thoiGianThaoTac',
            width: 170,
            sorter: (a: any, b: any) => (a.thoiGianThaoTac || '').localeCompare(b.thoiGianThaoTac || ''),
            defaultSortOrder: 'descend' as const,
            render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm:ss') : '-',
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'idTaiKhoanThaoTac',
            key: 'idTaiKhoanThaoTac',
            render: (val?: number) => <Text strong>{getUserLabel(val)}</Text>,
        },
        {
            title: 'API Method',
            dataIndex: 'phuongThucApi',
            key: 'phuongThucApi',
            width: 100,
            align: 'center' as const,
            render: (val?: string) => renderMethod(val),
        },
        {
            title: 'Endpoint',
            dataIndex: 'endpointApi',
            key: 'endpointApi',
            ellipsis: true,
        },
        {
            title: 'Thực thể tác động',
            dataIndex: 'thucTheTacDong',
            key: 'thucTheTacDong',
            width: 180,
        },
        {
            title: 'ID Bản ghi',
            dataIndex: 'idBanGhi',
            key: 'idBanGhi',
            width: 100,
            align: 'center' as const,
            render: (val?: number) => val || '-',
        },
        {
            title: 'Hành động',
            key: 'hanhDong',
            width: 110,
            align: 'center' as const,
            render: (_: any, record: NhatKyThaoTacHeThongResponse) => (
                <Button size="small" icon={<EyeOutlined />} onClick={() => handleOpenDetail(record)}>
                    Chi tiết
                </Button>
            ),
        },
    ];

    return (
        <QuyenHanGuard quyenYeuCau={QUYEN.XEM_NHAT_KY_THAO_TAC}>
            <div style={{ padding: 24 }}>
                <div style={{ marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0 }}>Nhật ký thao tác hệ thống</Title>
                    <Text type="secondary">Truy vết lịch sử hoạt động, chỉnh sửa cấu hình, tác động nghiệp vụ từ người dùng và hệ thống.</Text>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={5}>
                            <Select
                                placeholder="Người thực hiện"
                                style={{ width: '100%' }}
                                value={idTaiKhoanThaoTac}
                                onChange={setIdTaiKhoanThaoTac}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={nguoiDungOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                            />
                        </Col>
                        <Col xs={24} md={4}>
                            <Select
                                placeholder="API Method"
                                style={{ width: '100%' }}
                                value={phuongThucApi}
                                onChange={setPhuongThucApi}
                                allowClear
                                options={[
                                    { value: 'POST', label: 'POST (Thêm)' },
                                    { value: 'PUT', label: 'PUT (Sửa)' },
                                    { value: 'DELETE', label: 'DELETE (Xóa)' },
                                    { value: 'GET', label: 'GET (Truy xuất)' },
                                ]}
                            />
                        </Col>
                        <Col xs={24} md={5}>
                            <Input
                                placeholder="Thực thể tác động..."
                                value={thucTheTacDong}
                                onChange={e => setThucTheTacDong(e.target.value)}
                                onPressEnter={handleSearch}
                                allowClear
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <RangePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                value={dateRange}
                                onChange={setDateRange}
                                placeholder={['Từ ngày', 'Đến ngày']}
                            />
                        </Col>
                        <Col xs={24} md={4}>
                            <Space>
                                <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>Tìm kiếm</Button>
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

                <Modal
                    title="Chi tiết nhật ký thao tác"
                    open={isDetailOpen}
                    onCancel={() => { setIsDetailOpen(false); setSelectedLog(null); }}
                    footer={[
                        <Button key="close" onClick={() => { setIsDetailOpen(false); setSelectedLog(null); }}>Đóng</Button>
                    ]}
                    width={850}
                >
                    {selectedLog && (
                        <div style={{ marginTop: 16 }}>
                            <Descriptions bordered column={2} size="small">
                                <Descriptions.Item label="Thời gian thực hiện" span={2}>
                                    {selectedLog.thoiGianThaoTac ? dayjs(selectedLog.thoiGianThaoTac).format('DD/MM/YYYY HH:mm:ss') : '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Người thực hiện">
                                    {getUserLabel(selectedLog.idTaiKhoanThaoTac)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ IP">
                                    {selectedLog.diaChiIp || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="HTTP Method">
                                    {renderMethod(selectedLog.phuongThucApi)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Endpoint API">
                                    <Text code>{selectedLog.endpointApi}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Thực thể tác động">
                                    {selectedLog.thucTheTacDong || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="ID Bản ghi">
                                    {selectedLog.idBanGhi || '-'}
                                </Descriptions.Item>
                            </Descriptions>

                            <Row gutter={16} style={{ marginTop: 20 }}>
                                <Col span={12}>
                                    <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Dữ liệu trước (Before):</div>
                                    <pre style={{
                                        // background: '#f5f5f5',
                                        padding: 12,
                                        borderRadius: 4,
                                        maxHeight: 250,
                                        overflow: 'auto',
                                        fontSize: 12,
                                        border: '1px solid #e8e8e8'
                                    }}>
                                        {formatJson(selectedLog.duLieuTruoc)}
                                    </pre>
                                </Col>
                                <Col span={12}>
                                    <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Dữ liệu sau (After):</div>
                                    <pre style={{
                                        // background: '#f5f5f5',
                                        padding: 12,
                                        borderRadius: 4,
                                        maxHeight: 250,
                                        overflow: 'auto',
                                        fontSize: 12,
                                        border: '1px solid #e8e8e8'
                                    }}>
                                        {formatJson(selectedLog.duLieuSau)}
                                    </pre>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal>
            </div>
        </QuyenHanGuard>
    );
});

export default NhatKyThaoTacPage;
