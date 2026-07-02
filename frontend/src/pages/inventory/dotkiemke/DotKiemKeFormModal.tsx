import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col, DatePicker } from 'antd';
import dayjs from 'dayjs';
import type { DotKiemKeResponse } from '../../../api-generated/models/dotKiemKeResponse';
import type { DotKiemKeRequest } from '../../../api-generated/models/dotKiemKeRequest';

interface DotKiemKeFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: DotKiemKeResponse | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (values: DotKiemKeRequest) => Promise<void>;
    loading: boolean;
}

export const DotKiemKeFormModal: React.FC<DotKiemKeFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode,
    onSave,
    loading,
}) => {
    const [form] = Form.useForm<DotKiemKeRequest>();
    const isView = mode === 'view';

    useEffect(() => {
        if (open) {
            if (selectedRecord) {
                form.setFieldsValue({
                    tenDotKiemKe: selectedRecord.tenDotKiemKe,
                    thoiGianBatDauDuKien: selectedRecord.thoiGianBatDauDuKien ? dayjs(selectedRecord.thoiGianBatDauDuKien) as any : undefined,
                    thoiGianKetThucDuKien: selectedRecord.thoiGianKetThucDuKien ? dayjs(selectedRecord.thoiGianKetThucDuKien) as any : undefined,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, selectedRecord, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload: DotKiemKeRequest = {
                tenDotKiemKe: values.tenDotKiemKe,
                thoiGianBatDauDuKien: values.thoiGianBatDauDuKien ? dayjs(values.thoiGianBatDauDuKien).format('YYYY-MM-DD[T]00:00:00') : '',
                thoiGianKetThucDuKien: values.thoiGianKetThucDuKien ? dayjs(values.thoiGianKetThucDuKien).format('YYYY-MM-DD[T]00:00:00') : '',
            };
            await onSave(payload);
        } catch (e) {
            // form validation failed
        }
    };

    const getTitle = () => {
        if (isView) return 'Chi tiết Đợt kiểm kê tài sản';
        return selectedRecord ? 'Cập nhật Đợt kiểm kê tài sản' : 'Tạo Đợt kiểm kê tài sản mới';
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
                        {selectedRecord ? 'Lưu cập nhật' : 'Tạo đợt kiểm kê'}
                    </Button>
                ]
            }
            width={600}
            style={{ top: 80 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item
                    name="tenDotKiemKe"
                    label="Tên đợt kiểm kê"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đợt kiểm kê!' }]}
                >
                    <Input disabled={isView} placeholder="Ví dụ: Đợt kiểm kê tài sản định kỳ năm 2026" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="thoiGianBatDauDuKien"
                            label="Thời gian bắt đầu dự kiến"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                        >
                            <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="thoiGianKetThucDuKien"
                            label="Thời gian kết thúc dự kiến"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}
                        >
                            <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};
