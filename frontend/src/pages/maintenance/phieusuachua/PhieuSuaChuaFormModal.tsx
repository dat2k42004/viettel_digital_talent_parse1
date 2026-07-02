import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, DatePicker, InputNumber, Space, Card, Divider, Typography } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { PhieuSuaChuaBaoTriResponse } from '../../../api-generated/models/phieuSuaChuaBaoTriResponse';
import type { PhieuSuaChuaBaoTriRequest } from '../../../api-generated/models/phieuSuaChuaBaoTriRequest';
import type { SelectOption } from '../../../api-generated/models/selectOption';
import type { KeHoachBaoTriDinhKyResponse } from '../../../api-generated/models/keHoachBaoTriDinhKyResponse';

import { laySelectOptions5 as layNccOptions } from '../../../api-generated/endpoints/nha-cung-cap-controller/nha-cung-cap-controller';
import { laySelectOptions1 as layThietBiOptions } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-cung-controller/danh-sach-thiet-bi-phan-cung-controller';
import { laySelectOptions8 as layLinhKienOptions } from '../../../api-generated/endpoints/linh-kien-phan-cung-controller/linh-kien-phan-cung-controller';
import { layDanhSach19 as layKeHoachList, layTheoId18 as layKeHoachDetail } from '../../../api-generated/endpoints/ke-hoach-bao-tri-controller/ke-hoach-bao-tri-controller';

const { Text } = Typography;

interface PhieuSuaChuaFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: PhieuSuaChuaBaoTriResponse | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (values: PhieuSuaChuaBaoTriRequest) => Promise<void>;
    loading: boolean;
}

export const PhieuSuaChuaFormModal: React.FC<PhieuSuaChuaFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode,
    onSave,
    loading,
}) => {
    const [form] = Form.useForm<PhieuSuaChuaBaoTriRequest>();
    const isView = mode === 'view';

    const [nccOptions, setNccOptions] = useState<SelectOption[]>([]);
    const [thietBiOptions, setThietBiOptions] = useState<SelectOption[]>([]);
    const [linhKienOptions, setLinhKienOptions] = useState<SelectOption[]>([]);
    const [keHoachOptions, setKeHoachOptions] = useState<KeHoachBaoTriDinhKyResponse[]>([]);

    const keHoachBaoTriId = Form.useWatch('keHoachBaoTriId', form);

    useEffect(() => {
        if (open) {
            // Load dropdown data
            Promise.all([
                layNccOptions(),
                layKeHoachList({ trangThai: 'DA_PHE_DUYET', size: 1000 })
            ]).then(([nccRes, khRes]) => {
                if (khRes.data && (khRes.data as any).content) {
                    setKeHoachOptions((khRes.data as any).content);
                }
                if (nccRes.data) setNccOptions(nccRes.data);
            }).catch(() => { });

            if (selectedRecord) {
                // If it's a detail record, it has chiTietTaiSan (from backend response)
                // PhieuSuaChuaBaoTriResponse contains chiTietTaiSan?: ChiTietBaoTriGeneralResponse[]
                // We split them back to devices and components based on type
                const chiTietTaiSan = selectedRecord.chiTietTaiSan || [];
                const thietBiList = chiTietTaiSan
                    .filter(item => item.loai === 'THIET_BI')
                    .map(item => ({
                        idDanhSachThietBiPhanCung: item.idTaiSanGoc,
                        tenMauTaiSan: item.tenMauTaiSan,
                        loaiHinhXuLy: item.loaiHinhXuLy,
                        idNhaCungCap: item.idNhaCungCap,
                        tinhTrangThietBi: item.tinhTrangThietBi,
                        chiPhi: item.chiPhi ? Number(item.chiPhi) : 0,
                    }));

                const linhKienList = chiTietTaiSan
                    .filter(item => item.loai === 'LINH_KIEN')
                    .map(item => ({
                        idLinhKienPhanCung: item.idTaiSanGoc,
                        tenMauTaiSan: item.tenMauTaiSan,
                        loaiHinhXuLy: item.loaiHinhXuLy,
                        idNhaCungCap: item.idNhaCungCap,
                        tinhTrangThietBi: item.tinhTrangThietBi,
                        chiPhi: item.chiPhi ? Number(item.chiPhi) : 0,
                    }));

                form.setFieldsValue({
                    keHoachBaoTriId: selectedRecord.keHoachBaoTriId,
                    thoiGianBatDau: selectedRecord.thoiGianBatDau ? dayjs(selectedRecord.thoiGianBatDau) as any : undefined,
                    thoiGianHoanThanhDuKien: selectedRecord.thoiGianHoanThanhDuKien ? dayjs(selectedRecord.thoiGianHoanThanhDuKien) as any : undefined,
                    ghiChu: selectedRecord.ghiChu,
                    danhSachThietBi: thietBiList,
                    danhSachLinhKien: linhKienList,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, selectedRecord, form]);

    useEffect(() => {
        if (!open) return;

        if (keHoachBaoTriId) {
            layKeHoachDetail(keHoachBaoTriId).then(async (res) => {
                if (res.data && res.data.chiTietPhanVi) {
                    const assetIds = res.data.chiTietPhanVi
                        .map(x => x.idTaiSanPhanCung)
                        .filter(Boolean) as number[];

                    if (assetIds.length > 0) {
                        const tbPromises = assetIds.map(id => layThietBiOptions({ idTaiSanPhanCung: id }));
                        const lkPromises = assetIds.map(id => layLinhKienOptions({ idTaiSanPhanCung: id }));

                        const [tbResults, lkResults] = await Promise.all([
                            Promise.all(tbPromises),
                            Promise.all(lkPromises)
                        ]);

                        const mergedTb: SelectOption[] = [];
                        const seenTbIds = new Set<number>();
                        tbResults.forEach(r => {
                            r.data?.forEach(opt => {
                                if (!seenTbIds.has(opt.id!)) {
                                    seenTbIds.add(opt.id!);
                                    mergedTb.push(opt);
                                }
                            });
                        });

                        const mergedLk: SelectOption[] = [];
                        const seenLkIds = new Set<number>();
                        lkResults.forEach(r => {
                            r.data?.forEach(opt => {
                                if (!seenLkIds.has(opt.id!)) {
                                    seenLkIds.add(opt.id!);
                                    mergedLk.push(opt);
                                }
                            });
                        });

                        setThietBiOptions(mergedTb);
                        setLinhKienOptions(mergedLk);
                    } else {
                        setThietBiOptions([]);
                        setLinhKienOptions([]);
                    }
                }
            }).catch(() => {
                // If it fails, fallback to loading all
                Promise.all([layThietBiOptions(), layLinhKienOptions()]).then(([tbRes, lkRes]) => {
                    if (tbRes.data) setThietBiOptions(tbRes.data);
                    if (lkRes.data) setLinhKienOptions(lkRes.data);
                });
            });
        } else {
            // Load all options
            Promise.all([layThietBiOptions(), layLinhKienOptions()]).then(([tbRes, lkRes]) => {
                if (tbRes.data) setThietBiOptions(tbRes.data);
                if (lkRes.data) setLinhKienOptions(lkRes.data);
            });
        }
    }, [keHoachBaoTriId, open]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                thoiGianBatDau: values.thoiGianBatDau ? dayjs(values.thoiGianBatDau).format('YYYY-MM-DD[T]00:00:00') : undefined,
                thoiGianHoanThanhDuKien: values.thoiGianHoanThanhDuKien ? dayjs(values.thoiGianHoanThanhDuKien).format('YYYY-MM-DD[T]00:00:00') : undefined,
            };
            await onSave(payload as any);
        } catch (e) {
            // Validation failed
        }
    };

    const getTitle = () => {
        if (isView) return 'Chi tiết Phiếu sửa chữa bảo trì';
        return selectedRecord ? 'Cập nhật Phiếu sửa chữa bảo trì' : 'Lập Phiếu sửa chữa bảo trì mới';
    };

    const loaiHinhOptions = [
        { value: 'GUI_BAO_HANH', label: 'Gửi bảo hành chính hãng' },
        { value: 'SUA_CHUA_DICH_VU', label: 'Sửa chữa dịch vụ ngoài' },
        { value: 'THAY_THE_MOI', label: 'Thay thế mới hoàn toàn' },
    ];

    return (
        <Modal
            title={getTitle()}
            open={open}
            onCancel={onCancel}
            confirmLoading={loading}
            footer={
                isView ? [
                    <Button key="close" onClick={onCancel}>Đóng</Button>
                ] : [
                    <Button key="cancel" onClick={onCancel} disabled={loading}>Hủy bỏ</Button>,
                    <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
                        {selectedRecord ? 'Lưu cập nhật' : 'Tạo phiếu sửa'}
                    </Button>
                ]
            }
            width={1100}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Divider orientation={'left' as any}>Thông tin chung chứng từ</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="keHoachBaoTriId"
                            label="Kế hoạch bảo trì áp dụng"
                            rules={[{ required: true, message: 'Vui lòng chọn kế hoạch bảo trì!' }]}
                        >
                            <Select
                                disabled={isView || !!selectedRecord}
                                placeholder="Chọn kế hoạch bảo trì đã phê duyệt"
                                showSearch
                                optionFilterProp="children"
                            >
                                {keHoachOptions.map(kh => (
                                    <Select.Option key={kh.id} value={kh.id}>
                                        {`[${kh.maKeHoach}] ${kh.tenKeHoach}`}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="thoiGianBatDau"
                            label="Ngày bắt đầu sửa chữa"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                        >
                            <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="thoiGianHoanThanhDuKien"
                            label="Ngày hoàn thành dự kiến"
                        >
                            <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="ghiChu" label="Ghi chú / Mô tả tình trạng">
                    <Input.TextArea disabled={isView} rows={2} placeholder="Nội dung ghi chú phiếu sửa chữa bảo trì..." />
                </Form.Item>

                <Divider orientation={'left' as any}>Danh sách thiết bị phần cứng cần sửa chữa</Divider>
                <Form.List name="danhSachThietBi">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 8 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={6}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'tenMauTaiSan']}
                                                label="Thiết bị phần cứng"
                                                rules={[{ required: true, message: 'Chọn thiết bị!' }]}
                                            >
                                                <Select
                                                    disabled={isView || !!selectedRecord}
                                                    showSearch
                                                    placeholder="Chọn thiết bị"
                                                    optionFilterProp="label"
                                                    options={thietBiOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'loaiHinhXuLy']}
                                                label="Hình thức xử lý"
                                                rules={[{ required: true, message: 'Chọn hình thức!' }]}
                                            >
                                                <Select disabled={isView} placeholder="Hình thức" options={loaiHinhOptions} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'idNhaCungCap']}
                                                label="Nhà cung cấp thực hiện"
                                            >
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    placeholder="Nhà cung cấp"
                                                    optionFilterProp="label"
                                                    options={nccOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'tinhTrangThietBi']}
                                                label="Tình trạng hỏng hóc"
                                                rules={[{ required: true, message: 'Nhập tình trạng!' }]}
                                            >
                                                <Input disabled={isView} placeholder="Ví dụ: Hỏng nguồn, sọc màn..." />
                                            </Form.Item>
                                        </Col>
                                        <Col span={3}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'chiPhi']}
                                                label="Chi phí dự kiến"
                                            >
                                                <InputNumber
                                                    disabled={isView}
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        {!isView && !selectedRecord && (
                                            <Col span={1} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
                                                <MinusCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && !selectedRecord && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm thiết bị cần sửa chữa
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                <Divider orientation={'left' as any}>Danh sách linh kiện phần cứng cần sửa chữa / thay thế</Divider>
                <Form.List name="danhSachLinhKien">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 8 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={6}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'tenMauTaiSan']}
                                                label="Linh kiện thực thể"
                                                rules={[{ required: true, message: 'Chọn linh kiện!' }]}
                                            >
                                                <Select
                                                    disabled={isView || !!selectedRecord}
                                                    showSearch
                                                    placeholder="Chọn linh kiện"
                                                    optionFilterProp="label"
                                                    options={linhKienOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'loaiHinhXuLy']}
                                                label="Hình thức xử lý"
                                                rules={[{ required: true, message: 'Chọn hình thức!' }]}
                                            >
                                                <Select disabled={isView} placeholder="Hình thức" options={loaiHinhOptions} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'idNhaCungCap']}
                                                label="Nhà cung cấp thực hiện"
                                            >
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    placeholder="Nhà cung cấp"
                                                    optionFilterProp="label"
                                                    options={nccOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'tinhTrangThietBi']}
                                                label="Tình trạng linh kiện"
                                                rules={[{ required: true, message: 'Nhập tình trạng!' }]}
                                            >
                                                <Input disabled={isView} placeholder="Ví dụ: Pin chai, ổ cứng bad..." />
                                            </Form.Item>
                                        </Col>
                                        <Col span={3}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'chiPhi']}
                                                label="Chi phí dự kiến"
                                            >
                                                <InputNumber
                                                    disabled={isView}
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        {!isView && !selectedRecord && (
                                            <Col span={1} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
                                                <MinusCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && !selectedRecord && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm linh kiện cần xử lý
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
};
