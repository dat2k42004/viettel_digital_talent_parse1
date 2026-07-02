import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, DatePicker, InputNumber, Space, Card, Divider, Typography } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { KeHoachBaoTriDinhKyResponse } from '../../../api-generated/models/keHoachBaoTriDinhKyResponse';
import type { KeHoachBaoTriDinhKyRequest } from '../../../api-generated/models/keHoachBaoTriDinhKyRequest';
import type { SelectOption } from '../../../api-generated/models/selectOption';
import { laySelectOptions3 as layPhanCungOptions } from '../../../api-generated/endpoints/tai-san-phan-cung-controller/tai-san-phan-cung-controller';

const { Text } = Typography;

interface KeHoachBaoTriFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: KeHoachBaoTriDinhKyResponse | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (values: KeHoachBaoTriDinhKyRequest) => Promise<void>;
    loading: boolean;
}

export const KeHoachBaoTriFormModal: React.FC<KeHoachBaoTriFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode,
    onSave,
    loading,
}) => {
    const [form] = Form.useForm<KeHoachBaoTriDinhKyRequest>();
    const isView = mode === 'view';
    const [phanCungOptions, setPhanCungOptions] = useState<SelectOption[]>([]);

    useEffect(() => {
        if (open) {
            layPhanCungOptions()
                .then(res => {
                    if (res.data) setPhanCungOptions(res.data);
                })
                .catch(() => { });

            if (selectedRecord) {
                const danhSachChiTiet = selectedRecord.chiTietPhanVi?.map(item => ({
                    idTaiSanPhanCung: item.idTaiSanPhanCung,
                })) || [];

                form.setFieldsValue({
                    tenKeHoach: selectedRecord.tenKeHoach,
                    chuKyLap: selectedRecord.chuKyLap,
                    thoiGianBatDauKeHoach: selectedRecord.thoiGianBatDauKeHoach ? dayjs(selectedRecord.thoiGianBatDauKeHoach) as any : undefined,
                    thoiGianKetThucKeHoach: selectedRecord.thoiGianKetThucKeHoach ? dayjs(selectedRecord.thoiGianKetThucKeHoach) as any : undefined,
                    chiPhiDuKien: selectedRecord.chiPhiDuKien as any,
                    noiDungBaoTri: selectedRecord.noiDungBaoTri,
                    danhSachChiTiet: danhSachChiTiet,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, selectedRecord, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                thoiGianBatDauKeHoach: values.thoiGianBatDauKeHoach ? dayjs(values.thoiGianBatDauKeHoach).format('YYYY-MM-DD') : undefined,
                thoiGianKetThucKeHoach: values.thoiGianKetThucKeHoach ? dayjs(values.thoiGianKetThucKeHoach).format('YYYY-MM-DD') : undefined,
            };
            await onSave(payload as any);
        } catch (e) {
            // validation failed
        }
    };

    const getTitle = () => {
        if (isView) return 'Chi tiết Kế hoạch bảo trì định kỳ';
        return selectedRecord ? 'Cập nhật Kế hoạch bảo trì định kỳ' : 'Lập Kế hoạch bảo trì định kỳ mới';
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
                        {selectedRecord ? 'Lưu cập nhật' : 'Tạo kế hoạch'}
                    </Button>
                ]
            }
            width={800}
            style={{ top: 40 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Divider orientation={'left' as any}>Thông tin chung kế hoạch</Divider>
                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item
                            name="tenKeHoach"
                            label="Tên kế hoạch bảo trì"
                            rules={[{ required: true, message: 'Vui lòng nhập tên kế hoạch!' }]}
                        >
                            <Input disabled={isView} placeholder="Ví dụ: Kế hoạch bảo trì máy chủ định kỳ Quý 3" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="chuKyLap"
                            label="Chu kỳ lặp"
                            rules={[{ required: true, message: 'Vui lòng chọn chu kỳ!' }]}
                        >
                            <Select disabled={isView} placeholder="Chọn chu kỳ">
                                <Select.Option value="HANG_TUAN">Hàng tuần</Select.Option>
                                <Select.Option value="HANG_THANG">Hàng tháng</Select.Option>
                                <Select.Option value="HANG_QUY">Hàng quý</Select.Option>
                                <Select.Option value="HANG_NAM">Hàng năm</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="thoiGianBatDauKeHoach"
                            label="Ngày bắt đầu kế hoạch"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                        >
                            <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="thoiGianKetThucKeHoach"
                            label="Ngày kết thúc kế hoạch"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}
                        >
                            <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="chiPhiDuKien" label="Chi phí dự kiến (VNĐ)">
                            <InputNumber disabled={isView} style={{ width: '100%' }} min={0} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </Col>
                </Row>

                {selectedRecord?.lyDoTuChoi && (
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Lý do bị từ chối">
                                <Input.TextArea disabled value={selectedRecord.lyDoTuChoi} autoSize={{ minRows: 2 }} style={{ color: 'red' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                )}

                <Form.Item name="noiDungBaoTri" label="Nội dung bảo trì">
                    <Input.TextArea disabled={isView} rows={3} placeholder="Nội dung chi tiết các hạng mục cần bảo trì..." />
                </Form.Item>

                <Divider orientation={'left' as any}>Mẫu tài sản phần cứng áp dụng bảo trì</Divider>
                <Form.List name="danhSachChiTiet" rules={[{
                    validator: async (_, names) => {
                        if (!names || names.length < 1) {
                            return Promise.reject(new Error('Kế hoạch bảo trì phải có ít nhất một mẫu tài sản phần cứng!'));
                        }
                    }
                }]}>
                    {(fields, { add, remove }, { errors }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 8 }}>
                                    <Row gutter={16} align="middle">
                                        <Col span={22}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'idTaiSanPhanCung']}
                                                label="Mẫu mã phần cứng áp dụng"
                                                rules={[{ required: true, message: 'Vui lòng chọn mẫu phần cứng!' }]}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    placeholder="Chọn mẫu tài sản"
                                                    optionFilterProp="label"
                                                    options={phanCungOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        {!isView && (
                                            <Col span={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
                                                <MinusCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm mẫu mã tài sản áp dụng
                                    </Button>
                                    <Form.ErrorList errors={errors} />
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
};
