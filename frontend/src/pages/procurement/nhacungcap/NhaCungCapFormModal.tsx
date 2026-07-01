import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col } from 'antd';
import type { NhaCungCapResponse } from '../../../api-generated/models/nhaCungCapResponse';
import type { NhaCungCapRequest } from '../../../api-generated/models/nhaCungCapRequest';

interface NhaCungCapFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: NhaCungCapResponse | null;
    mode: 'add' | 'edit' | 'view'; // Đã bổ sung thuộc tính mode
    onSave: (values: NhaCungCapRequest) => Promise<void>;
    // loading: boolean;
}

export const NhaCungCapFormModal: React.FC<NhaCungCapFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode, // Nhận prop mode
    onSave,
    // loading,
}) => {
    const [form] = Form.useForm<NhaCungCapRequest>();
    const isView = mode === 'view'; // Xác định xem có phải đang ở chế độ xem chi tiết không

    useEffect(() => {
        if (open) {
            if (selectedRecord) {
                form.setFieldsValue({
                    maNhaCungCap: selectedRecord.maNhaCungCap,
                    tenNhaCungCap: selectedRecord.tenNhaCungCap,
                    maSoThue: selectedRecord.maSoThue,
                    nguoiLienHe: selectedRecord.nguoiLienHe,
                    soDienThoai: selectedRecord.soDienThoai,
                    email: selectedRecord.email,
                    diaChi: selectedRecord.diaChi,
                    ghiChu: selectedRecord.ghiChu,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, selectedRecord, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onSave(values as NhaCungCapRequest);
        } catch (e) {
            // Validate form failed
        }
    };

    // Thay đổi Title Modal dựa trên mode
    const getTitle = () => {
        if (isView) return 'Chi tiết thông tin Nhà cung cấp';
        return selectedRecord ? 'Cập nhật thông tin Nhà cung cấp' : 'Thêm mới Nhà cung cấp';
    };

    return (
        <Modal
            title={getTitle()}
            open={open}
            onCancel={onCancel}
            // confirmLoading={loading}
            footer={
                isView
                    ? [
                        <Button key="close" onClick={onCancel}>
                            Đóng
                        </Button>,
                    ]
                    : [
                        <Button key="cancel" onClick={onCancel}>
                            Hủy bỏ
                        </Button>,
                        <Button key="submit" type="primary" onClick={handleSubmit}>
                            Xác nhận lưu
                        </Button>,
                    ]
            }
            width={700}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="maNhaCungCap" label="Mã nhà cung cấp">
                            <Input disabled placeholder="Mã hệ thống tự sinh" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="tenNhaCungCap"
                            label="Tên nhà cung cấp / Đối tác"
                            rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp!' }]}
                        >
                            <Input disabled={isView} placeholder="Ví dụ: Công ty Cổ phần Máy tính ABC" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="maSoThue" label="Mã số thuế">
                            <Input disabled={isView} placeholder="Nhập mã số thuế doanh nghiệp" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="nguoiLienHe" label="Người liên hệ (Đại diện)">
                            <Input disabled={isView} placeholder="Ví dụ: Nguyễn Văn A - NVKD" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="soDienThoai" label="Số điện thoại">
                            <Input disabled={isView} placeholder="Ví dụ: 0987654321" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label="Email liên hệ"
                            rules={[{ type: 'email', message: 'Email không đúng định dạng!' }]}
                        >
                            <Input disabled={isView} placeholder="Ví dụ: contact@abc.com" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="diaChi" label="Địa chỉ trụ sở">
                    <Input disabled={isView} placeholder="Nhập địa chỉ nhà cung cấp" />
                </Form.Item>

                <Form.Item name="ghiChu" label="Ghi chú">
                    <Input.TextArea disabled={isView} rows={3} placeholder="Ghi chú thêm về nhà cung cấp này..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};