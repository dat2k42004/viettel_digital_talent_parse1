import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, Card, Divider } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { SelectOption } from '../../../api-generated/models/selectOption';

// Đã cập nhật hàm layAllocationsCuaNhanVien
import { layAllocationsCuaNhanVien } from '../../../api-generated/endpoints/phieu-thu-hoi-tai-san-controller/phieu-thu-hoi-tai-san-controller';
import { laySelectOptions6 as layNguoiDungOptions } from '../../../api-generated/endpoints/nguoi-dung-controller/nguoi-dung-controller';
import { laySelectOptions4 as layPhongBanOptions } from '../../../api-generated/endpoints/phong-ban-controller/phong-ban-controller';

interface PhieuThuHoiFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: any | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (values: any) => Promise<void>;
    loading: boolean;
}

export const PhieuThuHoiFormModal: React.FC<PhieuThuHoiFormModalProps> = ({
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
    const [nguoiDungOptions, setNguoiDungOptions] = useState<SelectOption[]>([]);

    // State lưu danh sách tài sản nhân viên ĐANG MƯỢN (Lấy từ API active-allocations)
    const [activeHardwareOptions, setActiveHardwareOptions] = useState<any[]>([]);
    const [activeSoftwareOptions, setActiveSoftwareOptions] = useState<any[]>([]);
    const [activeComponentOptions, setActiveComponentOptions] = useState<any[]>([]);

    const idPhongBanTra = Form.useWatch('idPhongBanTra', form);
    const idNhanVienTra = Form.useWatch('idNhanVienTra', form);

    useEffect(() => {
        if (open) {
            layPhongBanOptions()
                .then(res => { if (res.data) setPhongBanOptions(res.data); })
                .catch(() => { });

            if (selectedRecord) {
                const danhSachPhanCung = selectedRecord.chiTietTaiSan
                    ?.filter((item: any) => item.loai === 'PHAN_CUNG')
                    .map((item: any) => ({
                        chiTietCapPhatPhanCungId: item.idChiTietCapPhat,
                        tinhTrangLucThuHoi: item.tinhTrangLucThuHoi,
                        phuKienThuHoi: item.phuKienThuHoi,
                        ghiChu: item.ghiChu,
                    })) || [];

                const danhSachPhanMem = selectedRecord.chiTietTaiSan
                    ?.filter((item: any) => item.loai === 'PHAN_MEM')
                    .map((item: any) => ({
                        chiTietCapPhatPhanMemId: item.idChiTietCapPhat,
                        ghiChu: item.ghiChu,
                    })) || [];

                const danhSachLinhKien = selectedRecord.chiTietTaiSan
                    ?.filter((item: any) => item.loai === 'LINH_KIEN')
                    .map((item: any) => ({
                        chiTietCapPhatLinhKienId: item.idChiTietCapPhat,
                        tinhTrangLucThuHoi: item.tinhTrangLucThuHoi,
                        phuKienThuHoi: item.phuKienThuHoi,
                        ghiChu: item.ghiChu,
                    })) || [];

                form.setFieldsValue({
                    idPhongBanTra: selectedRecord.idPhongBanTra,
                    idNhanVienTra: selectedRecord.idNhanVienTra,
                    lyDoThuHoi: selectedRecord.lyDoThuHoi,
                    danhSachPhanCung,
                    danhSachPhanMem,
                    danhSachLinhKien,
                });
            } else {
                form.resetFields();
                setActiveHardwareOptions([]);
                setActiveSoftwareOptions([]);
                setActiveComponentOptions([]);
            }
        }
    }, [open, selectedRecord, form]);

    useEffect(() => {
        if (idPhongBanTra) {
            layNguoiDungOptions({ idPhongBan: idPhongBanTra })
                .then(res => { if (res.data) setNguoiDungOptions(res.data); })
                .catch(() => setNguoiDungOptions([]));
        } else {
            setNguoiDungOptions([]);
        }
    }, [idPhongBanTra]);

    useEffect(() => {
        if (idNhanVienTra) {
            // Sử dụng hàm layAllocationsCuaNhanVien từ Orval
            layAllocationsCuaNhanVien({ idNhanVien: idNhanVienTra })
                .then(res => {
                    if (res.code === 200 && res.data) {
                        setActiveHardwareOptions(res.data.danhSachPhanCung || []);
                        setActiveSoftwareOptions(res.data.danhSachPhanMem || []);
                        setActiveComponentOptions(res.data.danhSachLinhKien || []);
                    }
                })
                .catch(() => {
                    setActiveHardwareOptions([]);
                    setActiveSoftwareOptions([]);
                    setActiveComponentOptions([]);
                });
        } else {
            setActiveHardwareOptions([]);
            setActiveSoftwareOptions([]);
            setActiveComponentOptions([]);
        }
    }, [idNhanVienTra]);

    const getOptionsWithFallback = (activeOptions: any[], type: 'PHAN_CUNG' | 'PHAN_MEM' | 'LINH_KIEN', keyIdField: string) => {
        const merged = activeOptions.map(opt => ({
            value: opt[keyIdField],
            label: opt.tenThietBi || opt.tenPhanMem || opt.tenLinhKien
                ? `${opt.maTheTaiSan || opt.soSerial || opt.keyBanQuyen || ''} - ${opt.tenThietBi || opt.tenPhanMem || opt.tenLinhKien}`
                : `ID Phiếu Cấp: ${opt[keyIdField]}`
        }));

        if (selectedRecord && selectedRecord.chiTietTaiSan) {
            const itemsInRecord = selectedRecord.chiTietTaiSan.filter((i: any) => i.loai === type);
            itemsInRecord.forEach((item: any) => {
                if (item.idChiTietCapPhat && !merged.some(opt => opt.value === item.idChiTietCapPhat)) {
                    const labelDisplay = item.tenTaiSan
                        ? `${item.maTheTaiSan || item.soSerial || ''} - ${item.tenTaiSan} (Đã chọn)`
                        : `ID Phiếu Cấp: ${item.idChiTietCapPhat}`;
                    merged.push({ value: item.idChiTietCapPhat, label: labelDisplay });
                }
            });
        }
        return merged;
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
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
        if (isView) return 'Chi tiết Phiếu thu hồi';
        return selectedRecord ? 'Cập nhật Phiếu thu hồi' : 'Lập Phiếu thu hồi mới';
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
            width={1050}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Divider orientation={'left' as any}>Thông tin chung</Divider>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="idPhongBanTra" label="Phòng ban bàn giao trả" rules={[{ required: true, message: 'Vui lòng chọn phòng ban!' }]}>
                            <Select
                                disabled={isView}
                                placeholder="Chọn phòng ban"
                                showSearch
                                optionFilterProp="label"
                                options={phongBanOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                onChange={() => {
                                    form.setFieldValue('idNhanVienTra', undefined);
                                    form.setFieldValue('danhSachPhanCung', []);
                                    form.setFieldValue('danhSachPhanMem', []);
                                    form.setFieldValue('danhSachLinhKien', []);
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="idNhanVienTra" label="Nhân viên bàn giao trả" rules={[{ required: true, message: 'Vui lòng chọn nhân sự!' }]}>
                            <Select
                                disabled={isView || !idPhongBanTra}
                                placeholder={idPhongBanTra ? "Chọn nhân sự" : "Vui lòng chọn phòng ban trước"}
                                showSearch
                                optionFilterProp="label"
                                options={nguoiDungOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                onChange={() => {
                                    form.setFieldValue('danhSachPhanCung', []);
                                    form.setFieldValue('danhSachPhanMem', []);
                                    form.setFieldValue('danhSachLinhKien', []);
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="lyDoThuHoi" label="Lý do thu hồi" rules={[{ required: true, message: 'Nhập lý do thu hồi!' }]}>
                    <Input.TextArea disabled={isView} rows={2} placeholder="Nhập lý do thu hồi tài sản (VD: Nghỉ việc, Đổi thiết bị...)" />
                </Form.Item>

                {/* 1. MẢNG THU HỒI THIẾT BỊ PHẦN CỨNG */}
                <Divider orientation={'left' as any}>Danh sách Thu hồi - Thiết bị phần cứng</Divider>
                <Form.List name="danhSachPhanCung">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={8}>
                                            <Form.Item {...restField} name={[name, 'chiTietCapPhatPhanCungId']} label="Tài sản đang giữ" rules={[{ required: true, message: 'Chọn tài sản!' }]}>
                                                <Select
                                                    disabled={isView || !idNhanVienTra}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder={idNhanVienTra ? "Chọn thiết bị cần thu hồi" : "Chọn nhân sự trước"}
                                                    options={getOptionsWithFallback(activeHardwareOptions, 'PHAN_CUNG', 'chiTietCapPhatPhanCungId')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'tinhTrangLucThuHoi']} label="Tình trạng nhận lại" rules={[{ required: true, message: 'Nhập tình trạng!' }]}>
                                                <Input disabled={isView} placeholder="Ví dụ: Bình thường, Xước..." />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'phuKienThuHoi']} label="Phụ kiện trả lại">
                                                <Input disabled={isView} placeholder="Sạc, chuột..." />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
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
                                        Thêm thiết bị phần cứng cần thu hồi
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                {/* 2. MẢNG THU HỒI BẢN QUYỀN PHẦN MỀM */}
                <Divider orientation={'left' as any}>Danh sách Thu hồi - Bản quyền phần mềm</Divider>
                <Form.List name="danhSachPhanMem">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={16}>
                                            <Form.Item {...restField} name={[name, 'chiTietCapPhatPhanMemId']} label="Bản quyền phần mềm đang giữ" rules={[{ required: true, message: 'Chọn phần mềm!' }]}>
                                                <Select
                                                    disabled={isView || !idNhanVienTra}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder={idNhanVienTra ? "Chọn phần mềm cần thu hồi" : "Chọn nhân sự trước"}
                                                    options={getOptionsWithFallback(activeSoftwareOptions, 'PHAN_MEM', 'chiTietCapPhatPhanMemId')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label="Ghi chú">
                                                <Input disabled={isView} placeholder="Chú thích hủy cài đặt..." />
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
                                        Thêm bản quyền phần mềm cần thu hồi
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                {/* 3. MẢNG THU HỒI LINH KIÊN PHẦN CỨNG */}
                <Divider orientation={'left' as any}>Danh sách Thu hồi - Linh kiện rời</Divider>
                <Form.List name="danhSachLinhKien">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={8}>
                                            <Form.Item {...restField} name={[name, 'chiTietCapPhatLinhKienId']} label="Linh kiện đang giữ" rules={[{ required: true, message: 'Chọn linh kiện!' }]}>
                                                <Select
                                                    disabled={isView || !idNhanVienTra}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder={idNhanVienTra ? "Chọn linh kiện cần thu hồi" : "Chọn nhân sự trước"}
                                                    options={getOptionsWithFallback(activeComponentOptions, 'LINH_KIEN', 'chiTietCapPhatLinhKienId')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'tinhTrangLucThuHoi']} label="Tình trạng nhận lại" rules={[{ required: true, message: 'Nhập tình trạng!' }]}>
                                                <Input disabled={isView} placeholder="Ví dụ: Bình thường, Lỗi..." />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'phuKienThuHoi']} label="Phụ kiện trả lại">
                                                <Input disabled={isView} placeholder="Cáp, vỏ hộp..." />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
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
                                        Thêm linh kiện rời cần thu hồi
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