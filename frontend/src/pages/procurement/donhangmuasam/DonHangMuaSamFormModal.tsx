import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, DatePicker, InputNumber, Space, Card, Divider, Typography } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { DonHangMuaSamResponse } from '../../../api-generated/models/donHangMuaSamResponse';
import type { DonHangMuaSamRequest } from '../../../api-generated/models/donHangMuaSamRequest';
import type { SelectOption } from '../../../api-generated/models/selectOption';

// Chú ý: Đổi tên hàm import sao cho khớp với file endpoint sinh ra từ Orval
import { laySelectOptions5 as layNccOptions } from '../../../api-generated/endpoints/nha-cung-cap-controller/nha-cung-cap-controller';
import { laySelectOptions3 as layPhanCungOptions } from '../../../api-generated/endpoints/tai-san-phan-cung-controller/tai-san-phan-cung-controller';
import { laySelectOptions2 as layPhanMemOptions } from '../../../api-generated/endpoints/tai-san-phan-mem-controller/tai-san-phan-mem-controller';

const { Text } = Typography;

interface DonHangMuaSamFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: DonHangMuaSamResponse | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (values: DonHangMuaSamRequest) => Promise<void>;
    loading: boolean;
}

export const DonHangMuaSamFormModal: React.FC<DonHangMuaSamFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode,
    onSave,
    loading,
}) => {
    const [form] = Form.useForm<DonHangMuaSamRequest>();
    const isView = mode === 'view';

    const [nccOptions, setNccOptions] = useState<SelectOption[]>([]);
    const [phanCungOptions, setPhanCungOptions] = useState<SelectOption[]>([]);
    const [phanMemOptions, setPhanMemOptions] = useState<SelectOption[]>([]);

    useEffect(() => {
        if (open) {
            // Gọi 3 API đồng thời để lấy dữ liệu cho Dropdown
            Promise.all([layNccOptions(), layPhanCungOptions(), layPhanMemOptions()])
                .then(([nccRes, pcRes, pmRes]) => {
                    if (nccRes.data) setNccOptions(nccRes.data);
                    if (pcRes.data) setPhanCungOptions(pcRes.data);
                    if (pmRes.data) setPhanMemOptions(pmRes.data);
                })
                .catch(() => {
                    // Bỏ qua lỗi hiển thị
                });

            if (selectedRecord) {
                // Bóc tách mảng chiTietTaiSan (phẳng) thành 2 mảng riêng biệt cho Form.List
                const chiTietPhanCung = selectedRecord.chiTietTaiSan
                    ?.filter(item => item.loai === 'PHAN_CUNG')
                    .map(item => ({
                        idTaiSanPhanCung: item.idTaiSan,
                        soLuongDat: item.soLuongDat,
                        donGiaDat: item.donGiaDat,
                        ghiChu: item.ghiChu,
                    })) || [];

                const chiTietPhanMem = selectedRecord.chiTietTaiSan
                    ?.filter(item => item.loai === 'PHAN_MEM')
                    .map(item => ({
                        idTaiSanPhanMem: item.idTaiSan,
                        soLuongDat: item.soLuongDat,
                        donGiaDat: item.donGiaDat,
                        ghiChu: item.ghiChu,
                    })) || [];

                form.setFieldsValue({
                    idNhaCungCap: selectedRecord.idNhaCungCap,
                    maDonHang: selectedRecord.maDonHang,
                    soHopDongDinhKem: selectedRecord.soHopDongDinhKem,
                    tongTienTruocThue: selectedRecord.tongTienTruocThue as any,
                    thueVat: selectedRecord.thueVat as any,
                    tongTienSauThue: selectedRecord.tongTienSauThue as any,
                    thoiGianGiaoDuKien: selectedRecord.thoiGianGiaoDuKien ? dayjs(selectedRecord.thoiGianGiaoDuKien) as any : undefined,
                    ghiChu: selectedRecord.ghiChu,
                    chiTietPhanCung: chiTietPhanCung,
                    chiTietPhanMem: chiTietPhanMem,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, selectedRecord, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            // Format lại ngày tháng trước khi gửi API
            const payload = {
                ...values,
                thoiGianGiaoDuKien: values.thoiGianGiaoDuKien ? dayjs(values.thoiGianGiaoDuKien).format('YYYY-MM-DD') : undefined,
            };
            await onSave(payload as any);
        } catch (e) {
            // Validate form failed
        }
    };

    const getTitle = () => {
        if (isView) return 'Chi tiết Đơn hàng mua sắm';
        return selectedRecord ? 'Cập nhật Đơn hàng mua sắm' : 'Lập Đơn hàng mua sắm mới';
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
                        {selectedRecord ? 'Lưu cập nhật' : 'Tạo đơn hàng'}
                    </Button>
                ]
            }
            width={1000} // Modal rộng hơn vì form Master-Detail
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Divider orientation={"left" as any}>Thông tin chung</Divider>
                <Row gutter={16}>
                    {selectedRecord && (
                        <Col span={8}>
                            <Form.Item name="maDonHang" label="Mã đơn hàng">
                                <Input disabled placeholder="Mã tự động sinh" />
                            </Form.Item>
                        </Col>
                    )}
                    <Col span={selectedRecord ? 16 : 24}>
                        <Form.Item
                            name="idNhaCungCap"
                            label="Nhà cung cấp"
                            rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp!' }]}
                        >
                            <Select
                                disabled={isView}
                                placeholder="Chọn nhà cung cấp"
                                showSearch
                                optionFilterProp="label"
                                options={nccOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="soHopDongDinhKem" label="Số hợp đồng đính kèm">
                            <Input disabled={isView} placeholder="Ví dụ: HD-2026-001" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="thoiGianGiaoDuKien" label="Ngày giao hàng dự kiến">
                            <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="tongTienTruocThue" label="Tổng tiền trước thuế (VNĐ)" rules={[{ required: true, message: 'Nhập số tiền!' }]}>
                            <InputNumber disabled={isView} style={{ width: '100%' }} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="thueVat" label="Tiền thuế VAT (VNĐ)" rules={[{ required: true, message: 'Nhập tiền thuế!' }]}>
                            <InputNumber disabled={isView} style={{ width: '100%' }} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="tongTienSauThue" label="Tổng tiền sau thuế (VNĐ)" rules={[{ required: true, message: 'Nhập tổng tiền!' }]}>
                            <InputNumber disabled={isView} style={{ width: '100%' }} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="ghiChu" label="Ghi chú">
                    <Input.TextArea disabled={isView} rows={2} placeholder="Nội dung ghi chú đơn hàng..." />
                </Form.Item>

                <Divider orientation={"left" as any}>Chi tiết Phần cứng</Divider>
                <Form.List name="chiTietPhanCung">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 8 }}>
                                    <Row gutter={16} align="middle">
                                        <Col span={9}>
                                            <Form.Item {...restField} name={[name, 'idTaiSanPhanCung']} label="Mẫu phần cứng" rules={[{ required: true, message: 'Chọn mẫu!' }]}>
                                                <Select disabled={isView} showSearch optionFilterProp="label" options={phanCungOptions.map(opt => ({ value: opt.id, label: opt.ten }))} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item {...restField} name={[name, 'soLuongDat']} label="Số lượng" rules={[{ required: true, message: 'Nhập SL!' }]}>
                                                <InputNumber disabled={isView} min={1} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'donGiaDat']} label="Đơn giá" rules={[{ required: true, message: 'Nhập giá!' }]}>
                                                <InputNumber disabled={isView} style={{ width: '100%' }} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label="Ghi chú">
                                                <Input disabled={isView} />
                                            </Form.Item>
                                        </Col>
                                        {!isView && (
                                            <Col span={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MinusCircleOutlined style={{ color: 'red', fontSize: 18, marginTop: 8 }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm phần cứng vào đơn hàng
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                <Divider orientation={"left" as any}>Chi tiết Bản quyền Phần mềm</Divider>
                <Form.List name="chiTietPhanMem">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 8 }}>
                                    <Row gutter={16} align="middle">
                                        <Col span={9}>
                                            <Form.Item {...restField} name={[name, 'idTaiSanPhanMem']} label="Mẫu phần mềm" rules={[{ required: true, message: 'Chọn phần mềm!' }]}>
                                                <Select disabled={isView} showSearch optionFilterProp="label" options={phanMemOptions.map(opt => ({ value: opt.id, label: opt.ten }))} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item {...restField} name={[name, 'soLuongDat']} label="Số lượng" rules={[{ required: true, message: 'Nhập SL!' }]}>
                                                <InputNumber disabled={isView} min={1} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'donGiaDat']} label="Đơn giá" rules={[{ required: true, message: 'Nhập giá!' }]}>
                                                <InputNumber disabled={isView} style={{ width: '100%' }} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label="Ghi chú">
                                                <Input disabled={isView} />
                                            </Form.Item>
                                        </Col>
                                        {!isView && (
                                            <Col span={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MinusCircleOutlined style={{ color: 'red', fontSize: 18, marginTop: 8 }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm phần mềm vào đơn hàng
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