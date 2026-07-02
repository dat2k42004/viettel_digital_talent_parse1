import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, Card, Divider, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined, ArrowRightOutlined } from '@ant-design/icons';
import type { SelectOption } from '../../../api-generated/models/selectOption';

// API Controllers
import { laySelectOptions6 as layNguoiDungOptions } from '../../../api-generated/endpoints/nguoi-dung-controller/nguoi-dung-controller';
import { laySelectOptions4 as layPhongBanOptions } from '../../../api-generated/endpoints/phong-ban-controller/phong-ban-controller';

// Kế thừa API lấy tài sản đang mượn từ Controller Thu Hồi
import { layAllocationsCuaNhanVien } from '../../../api-generated/endpoints/phieu-thu-hoi-tai-san-controller/phieu-thu-hoi-tai-san-controller';

interface PhieuDieuChuyenFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: any | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (values: any) => Promise<void>;
    loading: boolean;
}

export const PhieuDieuChuyenFormModal: React.FC<PhieuDieuChuyenFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode,
    onSave,
    loading,
}) => {
    const [form] = Form.useForm();
    const isView = mode === 'view';

    const [phongBanOptions, setPhongBanOptions] = useState<SelectOption[]>([]);

    // Mảng lưu danh sách người dùng cho 2 vế: Chuyển & Nhận
    const [nguoiChuyenOptions, setNguoiChuyenOptions] = useState<SelectOption[]>([]);
    const [nguoiNhanOptions, setNguoiNhanOptions] = useState<SelectOption[]>([]);

    // State lưu danh sách tài sản BÊN CHUYỂN đang mượn (để điều chuyển đi)
    const [activeHardwareOptions, setActiveHardwareOptions] = useState<any[]>([]);
    // const [activeSoftwareOptions, setActiveSoftwareOptions] = useState<any[]>([]);
    const [activeComponentOptions, setActiveComponentOptions] = useState<any[]>([]);

    const idPhongBanChuyen = Form.useWatch('idPhongBanChuyen', form);
    const idNguoiChuyen = Form.useWatch('idNguoiChuyen', form);
    const idPhongBanNhan = Form.useWatch('idPhongBanNhan', form);

    // 1. Lấy danh sách Phòng ban chung
    useEffect(() => {
        if (open) {
            layPhongBanOptions()
                .then(res => { if (res.data) setPhongBanOptions(res.data); })
                .catch(() => { });

            if (selectedRecord) {
                // Map mảng chiTietTaiSan phẳng sang DTO mảng của Điều chuyển
                // Lưu ý: DTO request mảng của điều chuyển theo chuẩn tài liệu 14.18 là chiTietCapPhatPhanCungId
                const danhSachPhanCung = selectedRecord.chiTietTaiSan
                    ?.filter((item: any) => item.loai === 'PHAN_CUNG')
                    .map((item: any) => ({
                        chiTietCapPhatPhanCungId: item.chiTietCapPhatId,
                        trangThaiXuat: item.trangThaiXuat,
                        ghiChu: item.ghiChu,
                    })) || [];

                const danhSachPhanMem = selectedRecord.chiTietTaiSan
                    ?.filter((item: any) => item.loai === 'PHAN_MEM')
                    .map((item: any) => ({
                        chiTietCapPhatPhanMemId: item.chiTietCapPhatId,
                        ghiChu: item.ghiChu,
                    })) || [];

                const danhSachLinhKien = selectedRecord.chiTietTaiSan
                    ?.filter((item: any) => item.loai === 'LINH_KIEN')
                    .map((item: any) => ({
                        chiTietCapPhatLinhKienId: item.chiTietCapPhatId,
                        trangThaiXuat: item.trangThaiXuat,
                        ghiChu: item.ghiChu,
                    })) || [];

                form.setFieldsValue({
                    idPhongBanChuyen: selectedRecord.idPhongBanChuyen,
                    idNguoiChuyen: selectedRecord.idNguoiChuyen,
                    idPhongBanNhan: selectedRecord.idPhongBanNhan,
                    idNguoiNhan: selectedRecord.idNguoiNhan,
                    lyDoDieuChuyen: selectedRecord.lyDoDieuChuyen,
                    danhSachPhanCung,
                    danhSachPhanMem,
                    danhSachLinhKien,
                });
            } else {
                form.resetFields();
                setActiveHardwareOptions([]);
                // setActiveSoftwareOptions([]);
                setActiveComponentOptions([]);
            }
        }
    }, [open, selectedRecord, form]);

    // 2. Logic cho Bên Giao (Chuyển đi)
    useEffect(() => {
        if (idPhongBanChuyen) {
            layNguoiDungOptions({ idPhongBan: idPhongBanChuyen })
                .then(res => { if (res.data) setNguoiChuyenOptions(res.data); })
                .catch(() => setNguoiChuyenOptions([]));
        } else {
            setNguoiChuyenOptions([]);
        }
    }, [idPhongBanChuyen]);

    useEffect(() => {
        if (idNguoiChuyen) {
            // Tái sử dụng hàm layAllocationsCuaNhanVien của Thu hồi
            layAllocationsCuaNhanVien({ idNhanVien: idNguoiChuyen })
                .then(res => {
                    if (res.code === 200 && res.data) {
                        setActiveHardwareOptions(res.data.danhSachPhanCung || []);
                        // setActiveSoftwareOptions(res.data.danhSachPhanMem || []);
                        setActiveComponentOptions(res.data.danhSachLinhKien || []);
                    }
                })
                .catch(() => {
                    setActiveHardwareOptions([]);
                    // setActiveSoftwareOptions([]);
                    setActiveComponentOptions([]);
                });
        } else {
            setActiveHardwareOptions([]);
            // setActiveSoftwareOptions([]);
            setActiveComponentOptions([]);
        }
    }, [idNguoiChuyen]);

    // 3. Logic cho Bên Nhận
    useEffect(() => {
        if (idPhongBanNhan) {
            layNguoiDungOptions({ idPhongBan: idPhongBanNhan })
                .then(res => { if (res.data) setNguoiNhanOptions(res.data); })
                .catch(() => setNguoiNhanOptions([]));
        } else {
            setNguoiNhanOptions([]);
        }
    }, [idPhongBanNhan]);

    // Lấy Option có dự phòng cho View/Edit
    const getOptionsWithFallback = (activeOptions: any[], type: 'PHAN_CUNG' | 'PHAN_MEM' | 'LINH_KIEN', keyIdField: string) => {
        const merged = activeOptions.map(opt => ({
            value: opt[keyIdField],
            label: opt.tenThietBi || opt.tenPhanMem || opt.tenLinhKien
                ? `${opt.maTheTaiSan || opt.soSerial || opt.keyBanQuyen || ''} - ${opt.tenThietBi || opt.tenPhanMem || opt.tenLinhKien}`
                : `ID Lịch sử cấp: ${opt[keyIdField]}`
        }));

        if (selectedRecord && selectedRecord.chiTietTaiSan) {
            const itemsInRecord = selectedRecord.chiTietTaiSan.filter((i: any) => i.loai === type);
            itemsInRecord.forEach((item: any) => {
                if (item.chiTietCapPhatId && !merged.some(opt => opt.value === item.chiTietCapPhatId)) {
                    const labelDisplay = item.tenTaiSan
                        ? `${item.maTheTaiSan || item.soSerial || ''} - ${item.tenTaiSan} (Đã chọn)`
                        : `ID Lịch sử cấp: ${item.chiTietCapPhatId}`;
                    merged.push({ value: item.chiTietCapPhatId, label: labelDisplay });
                }
            });
        }
        return merged;
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (values.idNguoiChuyen === values.idNguoiNhan) {
                message.error('Nhân viên chuyển và nhận không được trùng nhau!');
                return;
            }
            const payload = {
                ...values,
                danhSachPhanCung: values.danhSachPhanCung || [],
                danhSachPhanMem: values.danhSachPhanMem || [],
                danhSachLinhKien: values.danhSachLinhKien || [],
            };
            await onSave(payload);
        } catch (e) {
            // Lỗi validate
        }
    };

    const getTitle = () => {
        if (isView) return 'Chi tiết Phiếu điều chuyển';
        return selectedRecord ? 'Cập nhật Phiếu điều chuyển' : 'Lập Phiếu điều chuyển mới';
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
                        {selectedRecord ? 'Lưu cập nhật' : 'Tạo phiếu'}
                    </Button>
                ]
            }
            width={1100}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Row gutter={24}>
                    {/* CỘT BÊN GIAO */}
                    <Col span={11}>
                        <Card title="BÊN GIAO TÀI SẢN (NGƯỜI CHUYỂN)" size="small" type="inner">
                            <Form.Item name="idPhongBanChuyen" label="Phòng ban chuyển" rules={[{ required: true, message: 'Chọn phòng ban!' }]}>
                                <Select
                                    disabled={isView}
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder="Chọn phòng ban hiện tại"
                                    options={phongBanOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                    onChange={() => {
                                        form.setFieldValue('idNguoiChuyen', undefined);
                                        form.setFieldValue('danhSachPhanCung', []);
                                        form.setFieldValue('danhSachPhanMem', []);
                                        form.setFieldValue('danhSachLinhKien', []);
                                    }}
                                />
                            </Form.Item>
                            <Form.Item name="idNguoiChuyen" label="Nhân viên bàn giao" rules={[{ required: true, message: 'Chọn nhân viên!' }]}>
                                <Select
                                    disabled={isView || !idPhongBanChuyen}
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={idPhongBanChuyen ? "Chọn nhân sự đang giữ tài sản" : "Chọn phòng ban trước"}
                                    options={nguoiChuyenOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                    onChange={() => {
                                        form.setFieldValue('danhSachPhanCung', []);
                                        form.setFieldValue('danhSachPhanMem', []);
                                        form.setFieldValue('danhSachLinhKien', []);
                                    }}
                                />
                            </Form.Item>
                        </Card>
                    </Col>

                    {/* MŨI TÊN ĐIỀU CHUYỂN */}
                    <Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowRightOutlined style={{ fontSize: '32px', color: '#1890ff', opacity: 0.5 }} />
                    </Col>

                    {/* CỘT BÊN NHẬN */}
                    <Col span={11}>
                        <Card title="BÊN NHẬN TÀI SẢN (NGƯỜI NHẬN)" size="small" type="inner">
                            <Form.Item name="idPhongBanNhan" label="Phòng ban tiếp nhận" rules={[{ required: true, message: 'Chọn phòng ban!' }]}>
                                <Select
                                    disabled={isView}
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder="Chọn phòng ban đến"
                                    options={phongBanOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                    onChange={() => form.setFieldValue('idNguoiNhan', undefined)}
                                />
                            </Form.Item>
                            <Form.Item name="idNguoiNhan" label="Nhân viên tiếp nhận" rules={[{ required: true, message: 'Chọn nhân viên!' }]}>
                                <Select
                                    disabled={isView || !idPhongBanNhan}
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={idPhongBanNhan ? "Chọn nhân sự tiếp nhận" : "Chọn phòng ban trước"}
                                    options={nguoiNhanOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>

                <Form.Item name="lyDoDieuChuyen" label="Lý do điều chuyển" rules={[{ required: true, message: 'Nhập lý do điều chuyển!' }]} style={{ marginTop: 16 }}>
                    <Input.TextArea disabled={isView} rows={2} placeholder="Nhập lý do điều động tài sản sang đơn vị/nhân sự mới..." />
                </Form.Item>

                {/* 1. MẢNG ĐIỀU CHUYỂN THIẾT BỊ PHẦN CỨNG */}
                <Divider orientation={'left' as any}>Danh sách Điều chuyển - Thiết bị phần cứng</Divider>
                <Form.List name="danhSachPhanCung">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={9}>
                                            <Form.Item {...restField} name={[name, 'chiTietCapPhatPhanCungId']} label="Tài sản đang giữ (Bên giao)" rules={[{ required: true, message: 'Chọn tài sản!' }]}>
                                                <Select
                                                    disabled={isView || !idNguoiChuyen}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder={idNguoiChuyen ? "Chọn thiết bị cần điều chuyển" : "Chọn người giao trước"}
                                                    options={getOptionsWithFallback(activeHardwareOptions, 'PHAN_CUNG', 'chiTietCapPhatPhanCungId')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'trangThaiXuat']} label="Trạng thái khi bàn giao" rules={[{ required: true, message: 'Nhập trạng thái!' }]}>
                                                <Input disabled={isView} placeholder="Ví dụ: Bình thường, Xước nhẹ..." />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label="Ghi chú">
                                                <Input disabled={isView} placeholder="Nhập chú thích (Kèm phụ kiện...)" />
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
                                        Thêm thiết bị phần cứng cần điều chuyển
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                {/* 2. MẢNG ĐIỀU CHUYỂN BẢN QUYỀN PHẦN MỀM
                <Divider orientation={'left' as any}>Danh sách Điều chuyển - Bản quyền phần mềm</Divider>
                <Form.List name="danhSachPhanMem">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={16}>
                                            <Form.Item {...restField} name={[name, 'chiTietCapPhatPhanMemId']} label="Bản quyền phần mềm đang giữ (Bên giao)" rules={[{ required: true, message: 'Chọn phần mềm!' }]}>
                                                <Select
                                                    disabled={isView || !idNguoiChuyen}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder={idNguoiChuyen ? "Chọn phần mềm cần điều chuyển" : "Chọn người giao trước"}
                                                    options={getOptionsWithFallback(activeSoftwareOptions, 'PHAN_MEM', 'chiTietCapPhatPhanMemId')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label="Ghi chú">
                                                <Input disabled={isView} placeholder="Chú thích chuyển account..." />
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
                                        Thêm bản quyền phần mềm cần điều chuyển
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List> */}

                {/* 3. MẢNG ĐIỀU CHUYỂN LINH KIÊN PHẦN CỨNG */}
                <Divider orientation={'left' as any}>Danh sách Điều chuyển - Linh kiện rời</Divider>
                <Form.List name="danhSachLinhKien">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={9}>
                                            <Form.Item {...restField} name={[name, 'chiTietCapPhatLinhKienId']} label="Linh kiện đang giữ (Bên giao)" rules={[{ required: true, message: 'Chọn linh kiện!' }]}>
                                                <Select
                                                    disabled={isView || !idNguoiChuyen}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder={idNguoiChuyen ? "Chọn linh kiện cần điều chuyển" : "Chọn người giao trước"}
                                                    options={getOptionsWithFallback(activeComponentOptions, 'LINH_KIEN', 'chiTietCapPhatLinhKienId')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'trangThaiXuat']} label="Trạng thái khi bàn giao" rules={[{ required: true, message: 'Nhập trạng thái!' }]}>
                                                <Input disabled={isView} placeholder="Ví dụ: Bình thường..." />
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
                                        Thêm linh kiện rời cần điều chuyển
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