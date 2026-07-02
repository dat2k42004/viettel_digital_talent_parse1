import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, Card, Divider } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

import type { SelectOption } from '../../../api-generated/models/selectOption';
// IMPORT ĐÚNG CÁC DTO ĐƯỢC GENERATE
import type { PhieuThanhLyTaiSanResponse } from '../../../api-generated/models/phieuThanhLyTaiSanResponse';
import type { PhieuThanhLyTaiSanRequest } from '../../../api-generated/models/phieuThanhLyTaiSanRequest';

// API Controllers lấy danh sách thiết bị có thể thanh lý
import { laySelectOptions1 as layThietBiPhanCungOptions } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-cung-controller/danh-sach-thiet-bi-phan-cung-controller';
import { laySelectOptions as layThietBiPhanMemOptions } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-mem-controller/danh-sach-thiet-bi-phan-mem-controller';
import { laySelectOptions8 as layThietBiLinhKienOptions } from '../../../api-generated/endpoints/linh-kien-phan-cung-controller/linh-kien-phan-cung-controller';

interface PhieuThanhLyFormModalProps {
    open: boolean;
    onCancel: () => void;
    // Thay thế any bằng DTO Response
    selectedRecord: PhieuThanhLyTaiSanResponse | null;
    mode: 'add' | 'edit' | 'view';
    // Thay thế any bằng DTO Request
    onSave: (values: PhieuThanhLyTaiSanRequest) => Promise<void>;
    loading: boolean;
}

export const PhieuThanhLyFormModal: React.FC<PhieuThanhLyFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode,
    onSave,
    loading,
}) => {
    // Đưa Type cho Form
    const [form] = Form.useForm<PhieuThanhLyTaiSanRequest>();
    const isView = mode === 'view';

    // State lưu danh sách toàn bộ tài sản hợp lệ để thanh lý
    const [thietBiPhanCungOptions, setThietBiPhanCungOptions] = useState<SelectOption[]>([]);
    const [thietBiPhanMemOptions, setThietBiPhanMemOptions] = useState<SelectOption[]>([]);
    const [thietBiLinhKienOptions, setThietBiLinhKienOptions] = useState<SelectOption[]>([]);

    useEffect(() => {
        if (open) {
            Promise.all([
                layThietBiPhanCungOptions(),
                layThietBiPhanMemOptions(),
                layThietBiLinhKienOptions(),
            ])
                .then(([pcRes, pmRes, lkRes]) => {
                    if (pcRes.data) setThietBiPhanCungOptions(pcRes.data);
                    if (pmRes.data) setThietBiPhanMemOptions(pmRes.data);
                    if (lkRes.data) setThietBiLinhKienOptions(lkRes.data);
                })
                .catch(() => { });

            if (selectedRecord) {
                // Map mảng danhSachTaiSan (hoặc chiTietTaiSan) sang đúng chuẩn các field của DTO Request
                const danhSachTaiSan = selectedRecord.chiTietTaiSan || [];

                const danhSachPhanCung = danhSachTaiSan
                    .filter((item: any) => item.loai === 'PHAN_CUNG' || item.loaiTaiSan === 'PHAN_CUNG')
                    .map((item: any) => ({
                        idThietBiPhanCung: item.idTaiSan || item.thietBiId,
                        tienThuHoi: item.tienThuHoi || item.giaThanhLy,
                        ghiChu: item.ghiChu,
                    }));

                const danhSachPhanMem = danhSachTaiSan
                    .filter((item: any) => item.loai === 'PHAN_MEM' || item.loaiTaiSan === 'PHAN_MEM')
                    .map((item: any) => ({
                        idThietBiPhanMem: item.idTaiSan || item.thietBiId,
                        tienThuHoi: item.tienThuHoi || item.giaThanhLy,
                        ghiChu: item.ghiChu,
                    }));

                const danhSachLinhKien = danhSachTaiSan
                    .filter((item: any) => item.loai === 'LINH_KIEN' || item.loaiTaiSan === 'LINH_KIEN')
                    .map((item: any) => ({
                        idLinhKienPhanCung: item.idTaiSan || item.thietBiId,
                        tienThuHoi: item.tienThuHoi || item.giaThanhLy,
                        ghiChu: item.ghiChu,
                    }));

                form.setFieldsValue({
                    lyDoThanhLy: selectedRecord.lyDoThanhLy,
                    // ghiChu: selectedRecord.ghiChu,
                    danhSachPhanCung,
                    danhSachPhanMem,
                    danhSachLinhKien,
                } as any);
            } else {
                form.resetFields();
            }
        }
    }, [open, selectedRecord, form]);

    // Lấy Option có dự phòng (Fallback) khi xem/sửa những tài sản đã thanh lý không còn hiện ở list Options gốc
    const getOptionsWithFallback = (baseOptions: SelectOption[], type: 'PHAN_CUNG' | 'PHAN_MEM' | 'LINH_KIEN') => {
        const merged = [...baseOptions];
        const danhSachTaiSan = selectedRecord?.chiTietTaiSan || [];

        if (selectedRecord && danhSachTaiSan.length > 0) {
            const itemsInRecord = danhSachTaiSan.filter((i: any) => i.loai === type || i.loaiTaiSan === type);
            itemsInRecord.forEach((item: any) => {
                const idTaiSan = item.idTaiSan || item.thietBiId;
                if (idTaiSan && !merged.some(opt => opt.id === idTaiSan)) {
                    const labelDisplay = item.tenTaiSan
                        ? `${item.maTheTaiSan || item.soSerial || ''} - ${item.tenTaiSan}`
                        : `ID Tài sản: ${idTaiSan}`;
                    merged.push({ id: idTaiSan, ten: labelDisplay });
                }
            });
        }
        return merged.map(opt => ({ value: opt.id, label: opt.ten }));
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload: PhieuThanhLyTaiSanRequest = {
                ...values,
                danhSachPhanCung: values.danhSachPhanCung || [],
                danhSachPhanMem: values.danhSachPhanMem || [],
                danhSachLinhKien: values.danhSachLinhKien || [],
            };
            await onSave(payload);
        } catch (e) {
            // Lỗi validate form
        }
    };

    const getTitle = () => {
        if (isView) return 'Chi tiết Phiếu thanh lý';
        return selectedRecord ? 'Cập nhật Phiếu thanh lý' : 'Lập Phiếu thanh lý mới';
    };

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
                        {selectedRecord ? 'Lưu cập nhật' : 'Xác nhận lập phiếu'}
                    </Button>
                ]
            }
            width={1000}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>

                <Card size="small" title="Thông tin thanh lý chung" >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="lyDoThanhLy" label="Lý do / Mục đích thanh lý" rules={[{ required: true, message: 'Nhập lý do thanh lý!' }]}>
                                <Input.TextArea disabled={isView} rows={2} placeholder="Nhập lý do (VD: Tài sản đã quá cũ, hỏng hóc không thể sửa chữa...)" />
                            </Form.Item>
                        </Col>
                        {/* <Col span={24}>
                            <Form.Item name="ghiChu" label="Ghi chú thêm">
                                <Input.TextArea disabled={isView} rows={1} placeholder="Nhập các chú thích khác..." />
                            </Form.Item>
                        </Col> */}
                    </Row>
                </Card>

                {/* 1. MẢNG THANH LÝ THIẾT BỊ PHẦN CỨNG */}
                <Divider orientation={'left' as any}>Danh sách Thiết bị phần cứng</Divider>
                <Form.List name="danhSachPhanCung">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={10}>
                                            <Form.Item {...restField} name={[name, 'idThietBiPhanCung']} label="Thiết bị phần cứng" rules={[{ required: true, message: 'Chọn tài sản!' }]}>
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder="Chọn thiết bị cần thanh lý"
                                                    options={getOptionsWithFallback(thietBiPhanCungOptions, 'PHAN_CUNG')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item {...restField} name={[name, 'tienThuHoi']} label="Tiền thu hồi (VNĐ)">
                                                <Input disabled={isView} placeholder="Nhập giá dự kiến thu..." type="number" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label="Ghi chú">
                                                <Input disabled={isView} placeholder="Nhập chú thích..." />
                                            </Form.Item>
                                        </Col>
                                        {!isView && (
                                            <Col span={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MinusCircleOutlined style={{ color: 'red', fontSize: 18, marginTop: 8, cursor: 'pointer' }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm thiết bị phần cứng cần thanh lý
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                {/* 2. MẢNG THANH LÝ BẢN QUYỀN PHẦN MỀM */}
                <Divider orientation={'left' as any}>Danh sách Bản quyền phần mềm</Divider>
                <Form.List name="danhSachPhanMem">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={10}>
                                            <Form.Item {...restField} name={[name, 'idThietBiPhanMem']} label="Bản quyền phần mềm" rules={[{ required: true, message: 'Chọn phần mềm!' }]}>
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder="Chọn phần mềm cần hủy/thanh lý"
                                                    options={getOptionsWithFallback(thietBiPhanMemOptions, 'PHAN_MEM')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item {...restField} name={[name, 'tienThuHoi']} label="Tiền thu hồi (VNĐ)">
                                                <Input disabled={isView} placeholder="Nhập giá dự kiến thu..." type="number" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label="Ghi chú">
                                                <Input disabled={isView} placeholder="Chú thích hủy license..." />
                                            </Form.Item>
                                        </Col>
                                        {!isView && (
                                            <Col span={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MinusCircleOutlined style={{ color: 'red', fontSize: 18, marginTop: 8, cursor: 'pointer' }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm bản quyền phần mềm cần thanh lý
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                {/* 3. MẢNG THANH LÝ LINH KIÊN PHẦN CỨNG */}
                <Divider orientation={'left' as any}>Danh sách Linh kiện rời</Divider>
                <Form.List name="danhSachLinhKien">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={10}>
                                            <Form.Item {...restField} name={[name, 'idLinhKienPhanCung']} label="Linh kiện rời" rules={[{ required: true, message: 'Chọn linh kiện!' }]}>
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder="Chọn linh kiện cần thanh lý"
                                                    options={getOptionsWithFallback(thietBiLinhKienOptions, 'LINH_KIEN')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item {...restField} name={[name, 'tienThuHoi']} label="Tiền thu hồi (VNĐ)">
                                                <Input disabled={isView} placeholder="Nhập giá dự kiến thu..." type="number" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label="Ghi chú">
                                                <Input disabled={isView} placeholder="Nhập chú thích..." />
                                            </Form.Item>
                                        </Col>
                                        {!isView && (
                                            <Col span={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MinusCircleOutlined style={{ color: 'red', fontSize: 18, marginTop: 8, cursor: 'pointer' }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm linh kiện rời cần thanh lý
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